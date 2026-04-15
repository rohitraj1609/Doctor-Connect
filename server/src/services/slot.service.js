import TimeSlot from '../models/TimeSlot.js';
import Appointment from '../models/Appointment.js';
import { SLOT_STATUS, APPOINTMENT_STATUS } from '../utils/constants.js';
import { ApiError } from '../utils/apiError.js';

export function generateSlots(date, startTime, endTime, duration) {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  while (currentMin + duration <= endMin) {
    const sh = String(Math.floor(currentMin / 60)).padStart(2, '0');
    const sm = String(currentMin % 60).padStart(2, '0');
    const eh = String(Math.floor((currentMin + duration) / 60)).padStart(2, '0');
    const em = String((currentMin + duration) % 60).padStart(2, '0');
    slots.push({ startTime: `${sh}:${sm}`, endTime: `${eh}:${em}` });
    currentMin += duration;
  }
  return slots;
}

export async function bookSlot(slotId, patientId, reason) {
  // Validate slot exists and check date BEFORE claiming
  const slotCheck = await TimeSlot.findOne({ _id: slotId, status: SLOT_STATUS.AVAILABLE });
  if (!slotCheck) {
    throw new ApiError(409, 'Slot is no longer available');
  }

  // Reject past slots before claiming
  const now = new Date();
  const slotDate = new Date(slotCheck.date);
  const [h, m] = slotCheck.startTime.split(':').map(Number);
  slotDate.setHours(h, m, 0, 0);
  if (slotDate < now) {
    throw new ApiError(400, 'Cannot book a slot in the past');
  }

  // Atomic claim
  const slot = await TimeSlot.findOneAndUpdate(
    { _id: slotId, status: SLOT_STATUS.AVAILABLE },
    { $set: { status: SLOT_STATUS.BOOKED } },
    { new: true }
  );

  if (!slot) {
    throw new ApiError(409, 'Slot is no longer available');
  }

  // Create appointment — release slot if this fails
  let appointment;
  try {
    appointment = await Appointment.create({
      patientId,
      doctorId: slot.doctorId,
      slotId: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: APPOINTMENT_STATUS.SCHEDULED,
      reason: reason || '',
    });
  } catch (err) {
    // Release slot on failure to prevent orphaned BOOKED state
    await TimeSlot.updateOne({ _id: slotId }, { status: SLOT_STATUS.AVAILABLE });
    throw err;
  }

  await TimeSlot.updateOne({ _id: slotId }, { appointmentId: appointment._id });

  return appointment;
}

export async function rescheduleAppointment(appointmentId, newSlotId, patientId) {
  const oldAppointment = await Appointment.findOne({
    _id: appointmentId,
    patientId,
    status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.RESCHEDULED] },
  });

  if (!oldAppointment) {
    throw new ApiError(404, 'Appointment not found or cannot be rescheduled');
  }

  // Book new slot first (atomic)
  const newAppointment = await bookSlot(newSlotId, patientId, oldAppointment.reason);

  // Release old slot
  await TimeSlot.updateOne(
    { _id: oldAppointment.slotId },
    { status: SLOT_STATUS.AVAILABLE, appointmentId: null }
  );

  // Link appointments — new one stays SCHEDULED (it's the active one)
  oldAppointment.status = APPOINTMENT_STATUS.RESCHEDULED;
  oldAppointment.rescheduledTo = newAppointment._id;
  await oldAppointment.save();

  newAppointment.rescheduledFrom = oldAppointment._id;
  await newAppointment.save();

  return newAppointment;
}

export async function cancelAppointment(appointmentId, userId, reason) {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    $or: [{ patientId: userId }, { doctorId: userId }],
    status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.RESCHEDULED] },
  });

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found or cannot be cancelled');
  }

  await TimeSlot.updateOne(
    { _id: appointment.slotId },
    { status: SLOT_STATUS.AVAILABLE, appointmentId: null }
  );

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = reason || '';
  await appointment.save();

  return appointment;
}
