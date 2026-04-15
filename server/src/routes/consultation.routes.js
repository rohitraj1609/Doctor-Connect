import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  startConsultation, getConsultation, getConsultationByAppointment,
  endConsultation, getMessages, getMyConsultations,
} from '../controllers/consultation.controller.js';

const router = Router();

router.post('/start', authenticate, requireRole('doctor'), startConsultation);
router.get('/my', authenticate, getMyConsultations);
router.get('/appointment/:appointmentId', authenticate, getConsultationByAppointment);
router.get('/:consultationId', authenticate, getConsultation);
router.patch('/:consultationId/end', authenticate, requireRole('doctor'), endConsultation);
router.get('/:consultationId/messages', authenticate, getMessages);

export default router;
