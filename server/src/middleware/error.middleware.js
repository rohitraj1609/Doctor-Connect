import { ApiError } from '../utils/apiError.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message, data: null });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}`, data: null });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists`, data: null });
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON', data: null });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large', data: null });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
  });
}
