import { Router } from 'express';
import { getPositions, getRiskScore, getExposure } from '../controllers/portfolioController.js';

const router = Router();

router.get('/positions', getPositions);
router.get('/risk-score', getRiskScore);
router.get('/exposure', getExposure);

export default router;
