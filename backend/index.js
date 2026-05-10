import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import { fetchTracksByGenre } from './services/musicService.js';
import { setupSocketHandlers } from './controllers/gameController.js';

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: '*', // For development, allow all origins. In production, restrict this.
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Test Music API Route
app.get('/api/music/test', async (req, res) => {
  const genre = req.query.genre || 'K-Pop';
  const tracks = await fetchTracksByGenre(genre, 3);
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
  jwt.verify(token, process.env.JWT_SECRET || 'echoduel_super_secret_key', (err, user) => {
    if (!err) socket.user = user;
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
