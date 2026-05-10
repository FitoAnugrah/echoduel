import express from 'express';
import { getAllUsers, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, cancelFriendRequest } from '../controllers/friendController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/all', getAllUsers);
router.get('/', getFriends);
router.get('/requests', getFriendRequests);
router.post('/request', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.delete('/request/:friendId', cancelFriendRequest); // Maps to cancelRequest and declineRequest
router.delete('/decline/:friendId', declineFriendRequest); // Just in case

export default router;
