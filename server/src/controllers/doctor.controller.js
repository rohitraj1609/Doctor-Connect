import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import * as api from '../utils/apiResponse.js';

export async function listDoctors(req, res, next) {
  try {
    const { specialization, city, page = 1, limit = 12 } = req.query;
    const filter = { role: 'doctor', isApproved: true };

    if (specialization) filter.specialization = specialization;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [doctors, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshToken')
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1, experience: -1 }),
      User.countDocuments(filter),
    ]);

    return api.success(res, {
      doctors,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function searchDoctors(req, res, next) {
  try {
    const { q, specialization, city, page = 1, limit = 12 } = req.query;
    const filter = { role: 'doctor', isApproved: true };

    if (specialization) filter.specialization = specialization;
    if (city) filter['address.city'] = { $regex: city, $options: 'i' };

    if (q && q.trim()) {
      // Use regex search (works without text index on discriminator)
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { specialization: regex },
        { hospital: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [doctors, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshToken')
        .skip(skip)
        .limit(Number(limit))
        .sort({ rating: -1, experience: -1 }),
      User.countDocuments(filter),
    ]);

    return api.success(res, {
      doctors,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDoctorById(req, res, next) {
  try {
    const doctor = await User.findOne({ _id: req.params.doctorId, role: 'doctor' })
      .select('-passwordHash -refreshToken');

    if (!doctor) return api.error(res, 'Doctor not found', 404);
    return api.success(res, { doctor });
  } catch (err) {
    next(err);
  }
}

export async function getMyProfile(req, res, next) {
  try {
    const doctor = await User.findById(req.user.userId).select('-passwordHash -refreshToken');
    if (!doctor) return api.error(res, 'Profile not found', 404);
    return api.success(res, { doctor });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'specialization', 'qualifications',
      'experience', 'consultationFee', 'bio', 'hospital', 'address', 'profilePicUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const doctor = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
      .select('-passwordHash -refreshToken');
    return api.success(res, { doctor }, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

export async function getDoctorStats(req, res, next) {
  try {
    const Appointment = (await import('../models/Appointment.js')).default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [todayCount, weekCount, totalPatients] = await Promise.all([
      Appointment.countDocuments({ doctorId: req.user.userId, date: { $gte: today, $lt: tomorrow }, status: { $in: ['scheduled', 'rescheduled'] } }),
      Appointment.countDocuments({ doctorId: req.user.userId, date: { $gte: today, $lt: weekEnd }, status: { $in: ['scheduled', 'rescheduled'] } }),
      Appointment.distinct('patientId', { doctorId: req.user.userId }).then(ids => ids.length),
    ]);

    return api.success(res, { todayCount, weekCount, totalPatients });
  } catch (err) {
    next(err);
  }
}
