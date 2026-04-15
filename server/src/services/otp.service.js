import bcrypt from 'bcryptjs';
import Otp from '../models/Otp.js';
import { ApiError } from '../utils/apiError.js';

const OTP_COOLDOWN_MS = 60 * 1000; // 1 minute between OTPs for same target
const OTP_DAILY_CAP = 10;

export async function generateAndStoreOtp(target, type, purpose, userId = null) {
  // Rate limit: check if OTP was recently created for this target
  const recent = await Otp.findOne({ target, purpose, createdAt: { $gte: new Date(Date.now() - OTP_COOLDOWN_MS) } });
  if (recent) {
    throw new ApiError(429, 'Please wait 60 seconds before requesting another OTP');
  }

  // Daily cap: max 10 OTPs per target per day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyCount = await Otp.countDocuments({ target, createdAt: { $gte: todayStart } });
  if (dailyCount >= OTP_DAILY_CAP) {
    throw new ApiError(429, 'Daily OTP limit reached. Try again tomorrow.');
  }

  // Delete any existing OTP for this target+purpose
  await Otp.deleteMany({ target, purpose });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hashed = await bcrypt.hash(code, 10);

  await Otp.create({
    userId,
    target,
    type,
    purpose,
    code: hashed,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  return code;
}

export async function verifyOtp(target, purpose, code) {
  const otp = await Otp.findOne({ target, purpose });

  if (!otp) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (otp.attempts >= 5) {
    await Otp.deleteOne({ _id: otp._id });
    return { valid: false, message: 'Too many attempts. Request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(code, otp.code);

  if (!isMatch) {
    otp.attempts += 1;
    await otp.save();
    return { valid: false, message: `Invalid OTP. ${5 - otp.attempts} attempts remaining.` };
  }

  await Otp.deleteOne({ _id: otp._id });
  return { valid: true, message: 'OTP verified successfully' };
}
