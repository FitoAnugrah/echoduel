import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { register, login, googleLogin, updateProfile, updateAvatar, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Multer config for avatar uploads ────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// ─── Public routes ────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);
router.put('/avatar', authenticateToken, avatarUpload.single('avatar'), updateAvatar);

export default router;
