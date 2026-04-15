import { body } from 'express-validator';

export const registerPatientRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const registerDoctorRules = [
  ...registerPatientRules,
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const sendOtpRules = [
  body('target').trim().notEmpty().withMessage('Email or phone is required'),
  body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  body('purpose').isIn(['registration', 'login', 'password-reset']).withMessage('Invalid purpose'),
];

export const verifyOtpRules = [
  body('target').trim().notEmpty().withMessage('Email or phone is required'),
  body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('purpose').isIn(['registration', 'login', 'password-reset']).withMessage('Invalid purpose'),
];
