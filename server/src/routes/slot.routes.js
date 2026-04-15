import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import {
  bulkCreateSlots, getMySlots, getAvailableSlots, deleteSlot, blockSlot,
} from '../controllers/slot.controller.js';

const router = Router();

router.post('/bulk', authenticate, requireRole('doctor'), bulkCreateSlots);
router.get('/my-slots', authenticate, requireRole('doctor'), getMySlots);
router.delete('/:slotId', authenticate, requireRole('doctor'), deleteSlot);
router.patch('/:slotId/block', authenticate, requireRole('doctor'), blockSlot);
router.get('/doctor/:doctorId/available', authenticate, getAvailableSlots);

export default router;
