import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import { fetchTracks } from './services/musicService.js';
import { setupSocketHandlers } from './controllers/gameController.js';
import { getUsers } from './utils/db.js';

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
  : '*';

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.warn('⚠️  CLIENT_URL is not set. CORS will block all cross-origin requests in production.');
}

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded avatars as static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Test Music API Route
app.get('/api/music/test', async (req, res) => {
  const genre = req.query.genre || 'K-Pop';
  const difficulty = req.query.difficulty || 'Easy';
  const tracks = await fetchTracks(genre, difficulty, 3);
  res.json({
    message: `Fetched ${tracks.length} tracks for genre: ${genre}`,
    tracks
  });
});

// Socket.io initialization
const io = new Server(server, {
  cors: corsOptions,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(); // Allow connection but without user attached
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.warn(`Socket auth failed for ${socket.id}: ${err.message}`);
      return next();
    }
    // Look up fresh user data from DB so avatar/username are always current
    const users = getUsers();
    const dbUser = users.find(u => u.id === decoded.id);
    if (dbUser) {
      // Attach full user profile (without password) to socket
      const { password: _, ...userWithoutPassword } = dbUser;
      socket.user = userWithoutPassword;
    } else {
      // Fallback to JWT payload if user not found in DB
      socket.user = decoded;
    }
    next();
  });
});

io.on('connection', (socket) => {
  if (socket.user) {
    socket.join(socket.user.id); // Personal room for private messages
  }
});

app.set('io', io);
setupSocketHandlers(io);

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('EchoDuel Backend is running!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
