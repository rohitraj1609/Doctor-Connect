import Consultation from '../models/Consultation.js';
import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import { CONSULTATION_STATUS, APPOINTMENT_STATUS } from '../utils/constants.js';
import * as api from '../utils/apiResponse.js';

export async function startConsultation(req, res, next) {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return api.error(res, 'appointmentId is required', 400);

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user.userId,
      status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.RESCHEDULED] },
    });

    if (!appointment) return api.error(res, 'Appointment not found or not eligible', 404);

    // Check if consultation already exists
    let consultation = await Consultation.findOne({ appointmentId });
    if (consultation) {
      return api.success(res, { consultation }, 'Consultation already exists');
    }

    consultation = await Consultation.create({
      appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
    });

    appointment.consultationId = consultation._id;
    await appointment.save();

    return api.success(res, { consultation }, 'Consultation started', 201);
  } catch (err) {
    next(err);
  }
}

export async function getConsultation(req, res, next) {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.consultationId,
      $or: [{ doctorId: req.user.userId }, { patientId: req.user.userId }],
    })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName');

    if (!consultation) return api.error(res, 'Consultation not found', 404);
    return api.success(res, { consultation });
  } catch (err) {
    next(err);
  }
}

export async function getConsultationByAppointment(req, res, next) {
  try {
    const consultation = await Consultation.findOne({
      appointmentId: req.params.appointmentId,
      $or: [{ doctorId: req.user.userId }, { patientId: req.user.userId }],
    })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName');

    if (!consultation) return api.error(res, 'Consultation not found', 404);
    return api.success(res, { consultation });
  } catch (err) {
    next(err);
  }
}

export async function endConsultation(req, res, next) {
  try {
    const { summary, prescription, diagnosis, followUpDate } = req.body;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.consultationId, doctorId: req.user.userId, status: CONSULTATION_STATUS.ACTIVE },
      {
        status: CONSULTATION_STATUS.COMPLETED,
        endedAt: new Date(),
        summary: summary || '',
        prescription: prescription || '',
        diagnosis: diagnosis || '',
        followUpDate: followUpDate || undefined,
      },
      { new: true }
    );

    if (!consultation) return api.error(res, 'Consultation not found or already ended', 404);

    // Mark appointment as completed
    await Appointment.findByIdAndUpdate(consultation.appointmentId, {
      status: APPOINTMENT_STATUS.COMPLETED,
    });

    return api.success(res, { consultation }, 'Consultation ended');
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const consultation = await Consultation.findOne({
      _id: req.params.consultationId,
      $or: [{ doctorId: req.user.userId }, { patientId: req.user.userId }],
    });

    if (!consultation) return api.error(res, 'Consultation not found', 404);

    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({ consultationId: req.params.consultationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    return api.success(res, { messages });
  } catch (err) {
    next(err);
  }
}

export async function getMyConsultations(req, res, next) {
  try {
    const filter = req.user.role === 'doctor'
      ? { doctorId: req.user.userId }
      : { patientId: req.user.userId };

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const consultations = await Consultation.find(filter)
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName')
      .populate('appointmentId', 'date startTime endTime reason')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return api.success(res, { consultations });
  } catch (err) {
    next(err);
  }
}
