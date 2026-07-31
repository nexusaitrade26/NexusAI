import { Router } from 'express';
import { createOrder, closeOrder, preTradeCheck, getOrders, getMarketNews, getAIAnalysis } from '../controllers/tradeController.js';

const router = Router();

router.post('/pre-check', preTradeCheck);
router.post('/order', createOrder);
router.post('/order/close/:id', closeOrder);
router.get('/orders', getOrders);
router.get('/news', getMarketNews);
router.post('/ai-analysis', getAIAnalysis);

export default router;
