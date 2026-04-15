import mongoose from 'mongoose';
import { SLOT_STATUS } from '../utils/constants.js';

const timeSlotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, default: 30 },
  status: {
    type: String,
    enum: Object.values(SLOT_STATUS),
    default: SLOT_STATUS.AVAILABLE,
  },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  timezone: { type: String, default: 'Asia/Kolkata' },
  createdAt: { type: Date, default: Date.now },
});

timeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });
timeSlotSchema.index({ doctorId: 1, status: 1, date: 1 });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
export default TimeSlot;
