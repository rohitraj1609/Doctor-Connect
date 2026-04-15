import mongoose from 'mongoose';
import { OTP_TYPE, OTP_PURPOSE } from '../utils/constants.js';

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(OTP_TYPE) },
  purpose: { type: String, required: true, enum: Object.values(OTP_PURPOSE) },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ target: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
