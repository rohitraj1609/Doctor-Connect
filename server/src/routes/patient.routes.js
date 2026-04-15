import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/patient.controller.js';

const router = Router();

router.get('/me', authenticate, requireRole('patient'), getMyProfile);
router.put('/me', authenticate, requireRole('patient'), updateMyProfile);

export default router;
