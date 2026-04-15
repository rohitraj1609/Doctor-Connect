import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { config } from '../config/env.js';
import { generateAndStoreOtp, verifyOtp } from '../services/otp.service.js';
import { sendOtpEmail } from '../services/email.service.js';
import { sendOtpSms } from '../services/sms.service.js';
import * as api from '../utils/apiResponse.js';

function generateTokens(userId, role) {
  const accessToken = jwt.sign({ userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
  return { accessToken, refreshToken };
}

function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
}

export async function registerPatient(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password, gender, dateOfBirth } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return api.error(res, existing.email === email ? 'Email already registered' : 'Phone already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const patient = await Patient.create({
      firstName, lastName, email, phone, passwordHash,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
    });

    // Send email OTP
    const code = await generateAndStoreOtp(email, 'email', 'registration', patient._id);
    await sendOtpEmail(email, code);

    return api.success(res, { userId: patient._id }, 'Account created. OTP sent to email.', 201);
  } catch (err) {
    next(err);
  }
}

export async function registerDoctor(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password, specialization, experience, consultationFee, hospital, bio } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return api.error(res, existing.email === email ? 'Email already registered' : 'Phone already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const doctor = await Doctor.create({
      firstName, lastName, email, phone, passwordHash, specialization,
      experience: experience || 0,
      consultationFee: consultationFee || 0,
      hospital: hospital || '',
      bio: bio || '',
    });

    const code = await generateAndStoreOtp(email, 'email', 'registration', doctor._id);
    await sendOtpEmail(email, code);

    return api.success(res, { userId: doctor._id }, 'Doctor account created. OTP sent to email.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return api.error(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return api.error(res, 'Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      return api.error(res, 'Please verify your email first', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Store hashed refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return api.success(res, { accessToken, user: sanitizeUser(user) }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.clearCookie('refreshToken');
    return api.success(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return api.error(res, 'Refresh token required', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      return api.error(res, 'Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      return api.error(res, 'Invalid refresh token', 401);
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) {
      return api.error(res, 'Invalid refresh token', 401);
    }

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return api.success(res, { accessToken, user: sanitizeUser(user) }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function sendOtp(req, res, next) {
  try {
    const { target, type, purpose } = req.body;

    const code = await generateAndStoreOtp(target, type, purpose);

    if (type === 'email') {
      await sendOtpEmail(target, code);
    } else {
      await sendOtpSms(target, code);
    }

    return api.success(res, null, `OTP sent to ${type}`);
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpHandler(req, res, next) {
  try {
    const { target, type, code, purpose } = req.body;

    const result = await verifyOtp(target, purpose, code);
    if (!result.valid) {
      return api.error(res, result.message, 400);
    }

    // If email verification for registration, mark user as verified
    if (purpose === 'registration') {
      const field = type === 'email' ? 'isEmailVerified' : 'isPhoneVerified';
      const query = type === 'email' ? { email: target } : { phone: target };
      await User.findOneAndUpdate(query, { [field]: true });
    }

    return api.success(res, null, result.message);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return api.success(res, null, 'If the email is registered, an OTP has been sent.');
    }

    const code = await generateAndStoreOtp(email, 'email', 'password-reset', user._id);
    await sendOtpEmail(email, code);

    return api.success(res, null, 'If the email is registered, an OTP has been sent.');
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;

    const result = await verifyOtp(email, 'password-reset', code);
    if (!result.valid) {
      return api.error(res, result.message, 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return api.error(res, 'User not found', 404);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return api.success(res, null, 'Password reset successfully. Please login.');
  } catch (err) {
    next(err);
  }
}
