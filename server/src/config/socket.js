import { Server } from 'socket.io';
import { config } from './env.js';
import { socketAuth } from '../socket/middleware/socketAuth.js';
import { registerConsultationHandlers } from '../socket/handlers/consultation.handler.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, /\.ngrok-free\.app$/],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    maxHttpBufferSize: 1e6, // 1MB max message size
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    if (config.nodeEnv === 'development') {
      console.log(`Socket connected: ${socket.user.userId} (${socket.user.role})`);
    }
    registerConsultationHandlers(io, socket);
  });

  return io;
}
