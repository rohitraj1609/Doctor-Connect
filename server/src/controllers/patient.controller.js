import User from '../models/User.js';
import * as api from '../utils/apiResponse.js';

export async function getMyProfile(req, res, next) {
  try {
    const patient = await User.findById(req.user.userId).select('-passwordHash -refreshToken');
    if (!patient) return api.error(res, 'Profile not found', 404);
    return api.success(res, { patient });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth',
      'bloodGroup', 'allergies', 'address', 'emergencyContact', 'profilePicUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const patient = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
      .select('-passwordHash -refreshToken');
    return api.success(res, { patient }, 'Profile updated');
  } catch (err) {
    next(err);
  }
}
