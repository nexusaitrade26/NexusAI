import { Router } from 'express';
import { getClosedTrades, deleteClosedTrade, updateEmotionalTag, getJournalStats } from '../controllers/journalController.js';

const router = Router();

router.get('/trades', getClosedTrades);
router.delete('/trades/:id', deleteClosedTrade);
router.patch('/trades/:id/tag', updateEmotionalTag);
router.get('/stats', getJournalStats);

export default router;
