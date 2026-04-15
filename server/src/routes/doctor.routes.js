import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  listDoctors, getDoctorById, getMyProfile, updateMyProfile, getDoctorStats,
} from '../controllers/doctor.controller.js';

const router = Router();

// Public
router.get('/', listDoctors);
router.get('/me', authenticate, requireRole('doctor'), getMyProfile);
router.put('/me', authenticate, requireRole('doctor'), updateMyProfile);
router.get('/me/stats', authenticate, requireRole('doctor'), getDoctorStats);
router.get('/:doctorId', getDoctorById);

export default router;
