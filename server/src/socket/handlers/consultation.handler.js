import Consultation from '../../models/Consultation.js';
import Message from '../../models/Message.js';

export function registerConsultationHandlers(io, socket) {
  socket.on('join-consultation', async ({ consultationId }) => {
    try {
      const consultation = await Consultation.findById(consultationId);
      if (!consultation) return socket.emit('error', { message: 'Consultation not found' });

      const userId = socket.user.userId;
      if (String(consultation.doctorId) !== userId && String(consultation.patientId) !== userId) {
        return socket.emit('error', { message: 'Not authorized' });
      }

      socket.join(consultationId);
      socket.consultationId = consultationId;

      // System message
      io.to(consultationId).emit('user-joined', {
        userId: socket.user.userId,
        role: socket.user.role,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('send-message', async ({ consultationId, content }) => {
    try {
      if (!content?.trim()) return;

      const message = await Message.create({
        consultationId,
        senderId: socket.user.userId,
        senderRole: socket.user.role,
        content: content.trim(),
        type: 'text',
      });

      io.to(consultationId).emit('new-message', {
        _id: message._id,
        consultationId,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing-start', ({ consultationId }) => {
    socket.to(consultationId).emit('user-typing', {
      userId: socket.user.userId,
      role: socket.user.role,
    });
  });

  socket.on('typing-stop', ({ consultationId }) => {
    socket.to(consultationId).emit('user-stopped-typing', {
      userId: socket.user.userId,
    });
  });

  socket.on('leave-consultation', ({ consultationId }) => {
    socket.leave(consultationId);
    io.to(consultationId).emit('user-left', {
      userId: socket.user.userId,
      role: socket.user.role,
    });
  });

  socket.on('disconnect', () => {
    if (socket.consultationId) {
      io.to(socket.consultationId).emit('user-left', {
        userId: socket.user.userId,
        role: socket.user.role,
      });
    }
  });
}
