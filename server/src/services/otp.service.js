import bcrypt from 'bcryptjs';
import Otp from '../models/Otp.js';

export async function generateAndStoreOtp(target, type, purpose, userId = null) {
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
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  return code; // Return plain code to send via email/sms
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

  // OTP is valid - delete it
  await Otp.deleteOne({ _id: otp._id });
  return { valid: true, message: 'OTP verified successfully' };
}
