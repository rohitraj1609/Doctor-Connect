import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

export function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    socket.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
