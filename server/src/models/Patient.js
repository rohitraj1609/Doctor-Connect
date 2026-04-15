import User from './User.js';

const patientSchema = {
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
};

const Patient = User.discriminator('patient', new (await import('mongoose')).default.Schema(patientSchema));
export default Patient;
