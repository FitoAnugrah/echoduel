import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/conversations', getConversations);
router.get('/:friendId', getMessages);
router.post('/:friendId', sendMessage);

export default router;
