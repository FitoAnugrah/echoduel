import express from 'express';
import { getRooms, createRoom, getRoomDetail, joinRoomApi } from '../controllers/roomController.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoomDetail);
router.post('/:id/join', joinRoomApi);

export default router;
