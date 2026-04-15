import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many OTP requests. Wait a minute.', data: null },
});
import {
  registerPatientRules, registerDoctorRules, loginRules, sendOtpRules, verifyOtpRules,
} from '../validators/auth.validator.js';
import {
  registerPatient, registerDoctor, login, logout, refreshToken,
  sendOtp, verifyOtpHandler, forgotPassword, resetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register/patient', registerPatientRules, validate, registerPatient);
router.post('/register/doctor', registerDoctorRules, validate, registerDoctor);
router.post('/login', loginRules, validate, login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', otpLimiter, sendOtpRules, validate, sendOtp);
router.post('/verify-otp', verifyOtpRules, validate, verifyOtpHandler);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
