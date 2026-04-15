import mongoose from 'mongoose';
import User from './User.js';

const patientSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  allergies: [{ type: String }],
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
});

const Patient = User.discriminator('patient', patientSchema);
export default Patient;
