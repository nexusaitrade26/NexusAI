import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, getMe, updateProfile } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router;
