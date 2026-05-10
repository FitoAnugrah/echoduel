import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLeaderboard);

export default router;
