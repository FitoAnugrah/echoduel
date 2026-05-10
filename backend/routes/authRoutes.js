import express from 'express';
import { register, login, googleLogin, updateProfile, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected routes
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);

export default router;
