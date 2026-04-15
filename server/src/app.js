import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import searchRoutes from './routes/search.routes.js';
import slotRoutes from './routes/slot.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import consultationRoutes from './routes/consultation.routes.js';

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [config.clientUrl, /\.ngrok-free\.app$/],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'DocConnect API is running' });
});

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: { success: false, message: 'Too many requests, please try again later', data: null },
});
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTP requests per minute
  message: { success: false, message: 'Too many OTP requests, wait a minute', data: null },
});

// Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/consultations', consultationRoutes);

// Serve React client build in production/sharing mode
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, '../../client/dist');
app.use(express.static(clientDist, { dotfiles: 'deny' }));
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
  res.sendFile(join(clientDist, 'index.html'));
});

// Error handler
app.use(errorHandler);

export default app;
