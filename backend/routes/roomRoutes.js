import express from 'express';
import { getRooms, createRoom, getRoomDetail, joinRoomApi } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/rooms - public, anyone can browse rooms
router.get('/', getRooms);
router.get('/:id', getRoomDetail);

// POST routes require authentication
router.post('/', authenticateToken, createRoom);
router.post('/:id/join', authenticateToken, joinRoomApi);

export default router;
