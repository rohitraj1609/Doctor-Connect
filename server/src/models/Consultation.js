import mongoose from 'mongoose';
import { CONSULTATION_STATUS } from '../utils/constants.js';

const consultationSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: Object.values(CONSULTATION_STATUS),
    default: CONSULTATION_STATUS.ACTIVE,
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  summary: { type: String },
  prescription: { type: String },
  diagnosis: { type: String },
  followUpDate: { type: Date },
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
