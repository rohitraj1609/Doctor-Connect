import { Server } from 'socket.io';
import { config } from './env.js';
import { socketAuth } from '../socket/middleware/socketAuth.js';
import { registerConsultationHandlers } from '../socket/handlers/consultation.handler.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.userId} (${socket.user.role})`);
    registerConsultationHandlers(io, socket);
  });

  return io;
}
