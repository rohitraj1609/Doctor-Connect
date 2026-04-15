import { Router } from 'express';
import { searchDoctors } from '../controllers/doctor.controller.js';

const router = Router();

router.get('/doctors', searchDoctors);

export default router;
