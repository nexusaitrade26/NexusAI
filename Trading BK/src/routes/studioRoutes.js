import { Router } from 'express';
import { getLevels, getCategories, getLessonDetail, toggleLessonProgress } from '../controllers/studioController.js';

const router = Router();

router.get('/levels', getLevels);
router.get('/categories', getCategories);
router.get('/lessons/:id', getLessonDetail);
router.post('/lessons/:id/progress', toggleLessonProgress);

export default router;
