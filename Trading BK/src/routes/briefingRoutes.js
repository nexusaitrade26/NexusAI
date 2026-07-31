import { Router } from 'express';
import { getBriefing, getPerformanceCurve } from '../controllers/briefingController.js';

const router = Router();

router.get('/briefing', getBriefing);
router.get('/performance', getPerformanceCurve);

export default router;
