import mongoose from 'mongoose';
import User from './User.js';

const doctorFields = new mongoose.Schema({
  specialization: { type: String, required: true, index: true },
  qualifications: [{ type: String }],
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  bio: { type: String, maxlength: 500 },
  hospital: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  isApproved: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
});

doctorFields.index({ specialization: 1, 'address.city': 1 });
// Text index removed — doesn't work with discriminators. Regex search used in controller instead.

const Doctor = User.discriminator('doctor', doctorFields);
export default Doctor;
