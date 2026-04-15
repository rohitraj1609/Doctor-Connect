import Appointment from '../models/Appointment.js';
import { bookSlot, rescheduleAppointment, cancelAppointment } from '../services/slot.service.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';
import * as api from '../utils/apiResponse.js';

export async function createAppointment(req, res, next) {
  try {
    const { slotId, reason } = req.body;
    if (!slotId) return api.error(res, 'slotId is required', 400);

    const appointment = await bookSlot(slotId, req.user.userId, reason);
    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'firstName lastName specialization hospital')
      .populate('slotId');

    return api.success(res, { appointment: populated }, 'Appointment booked', 201);
  } catch (err) {
    if (err.statusCode) return api.error(res, err.message, err.statusCode);
    next(err);
  }
}

export async function getAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      $or: [{ patientId: req.user.userId }, { doctorId: req.user.userId }],
    })
      .populate('doctorId', 'firstName lastName specialization hospital profilePicUrl')
      .populate('patientId', 'firstName lastName email phone')
      .populate('slotId');

    if (!appointment) return api.error(res, 'Appointment not found', 404);
    return api.success(res, { appointment });
  } catch (err) {
    next(err);
  }
}

export async function getMyAppointments(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user.userId;
    } else {
      filter.doctorId = req.user.userId;
    }

    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('doctorId', 'firstName lastName specialization hospital profilePicUrl')
        .populate('patientId', 'firstName lastName email phone')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    return api.success(res, {
      appointments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function reschedule(req, res, next) {
  try {
    const { newSlotId } = req.body;
    if (!newSlotId) return api.error(res, 'newSlotId is required', 400);

    const appointment = await rescheduleAppointment(req.params.appointmentId, newSlotId, req.user.userId);
    return api.success(res, { appointment }, 'Appointment rescheduled');
  } catch (err) {
    if (err.statusCode) return api.error(res, err.message, err.statusCode);
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const { reason } = req.body;
    const appointment = await cancelAppointment(req.params.appointmentId, req.user.userId, reason);
    return api.success(res, { appointment }, 'Appointment cancelled');
  } catch (err) {
    if (err.statusCode) return api.error(res, err.message, err.statusCode);
    next(err);
  }
}

export async function completeAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctorId: req.user.userId, status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.RESCHEDULED] } },
      { status: APPOINTMENT_STATUS.COMPLETED, notes: req.body.notes || '' },
      { new: true }
    );
    if (!appointment) return api.error(res, 'Appointment not found', 404);
    return api.success(res, { appointment }, 'Appointment completed');
  } catch (err) {
    next(err);
  }
}

export async function markNoShow(req, res, next) {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctorId: req.user.userId, status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.RESCHEDULED] } },
      { status: APPOINTMENT_STATUS.NO_SHOW },
      { new: true }
    );
    if (!appointment) return api.error(res, 'Appointment not found', 404);
    return api.success(res, { appointment }, 'Marked as no-show');
  } catch (err) {
    next(err);
  }
}
