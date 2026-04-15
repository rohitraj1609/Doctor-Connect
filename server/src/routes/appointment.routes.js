import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  createAppointment, getAppointment, getMyAppointments,
  reschedule, cancel, completeAppointment, markNoShow,
} from '../controllers/appointment.controller.js';

const router = Router();

router.post('/', authenticate, requireRole('patient'), createAppointment);
router.get('/my', authenticate, getMyAppointments);
router.get('/:appointmentId', authenticate, getAppointment);
router.patch('/:appointmentId/reschedule', authenticate, requireRole('patient'), reschedule);
router.patch('/:appointmentId/cancel', authenticate, cancel);
router.patch('/:appointmentId/complete', authenticate, requireRole('doctor'), completeAppointment);
router.patch('/:appointmentId/no-show', authenticate, requireRole('doctor'), markNoShow);

export default router;
