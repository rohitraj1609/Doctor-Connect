import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['patient', 'doctor'], required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'system'], default: 'text' },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ consultationId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
