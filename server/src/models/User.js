import mongoose from 'mongoose';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(ROLES) },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    profilePicUrl: { type: String, default: '' },
    refreshToken: { type: String, default: null },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
  }
);

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
