import { activeRooms } from './gameController.js';
import { getUsers } from '../utils/db.js';

// ─── Difficulty presets ───────────────────────────────────────────────────────
const DIFFICULTY_PRESETS = {
  Easy:   { totalRounds: 3, roundDuration: 30 },
  Medium: { totalRounds: 5, roundDuration: 25 },
  Hard:   { totalRounds: 7, roundDuration: 20 },
};

export const getRooms = (req, res) => {
  const { genre } = req.query;
  // Only show rooms that are waiting for players (not mid-game or ended)
  const rooms = Array.from(activeRooms.values())
    .filter(room => room.gameState === 'waiting')
    .map(room => ({
      id: room.id,
      name: room.name,
      host: room.host,
      genre: room.genre,
      difficulty: room.difficulty || 'Easy',
      maxPlayers: room.maxPlayers || 2,
      currentPlayers: room.players.length,
      mode: 'Duel'
    }));

  if (genre && genre !== 'All') {
    return res.json(rooms.filter(r => r.genre === genre));
  }

  res.json(rooms);
};

export const createRoom = (req, res) => {
  // Host is taken from the authenticated JWT token, NOT from request body
  const userId = req.user.id;
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const { name, genre, difficulty, maxPlayers } = req.body;
  console.log("REST API createRoom menerima payload:", req.body);
  const roomId = `room_${Date.now()}`;
  
  // Apply difficulty presets
  const preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.Easy;

  activeRooms.set(roomId, {
    id: roomId,
    name: name || `${genre || 'Pop Indo'} Room`,
    host: user.username,       // verified from JWT, not from body
    hostId: user.id,           // store hostId for permission checks
    genre: genre || 'Pop Indo',
    difficulty: difficulty || 'Easy',
    maxPlayers: parseInt(maxPlayers) || 2,
    players: [],
    tracks: [],
    currentRound: 0,
    totalRounds: preset.totalRounds,
    roundDuration: preset.roundDuration,
    gameState: 'waiting',
    scores: []
  });

  res.status(201).json({
    id: roomId,
    name: name || `${genre || 'Pop Indo'} Room`,
    host: user.username,
    genre,
    difficulty,
    maxPlayers
  });
};

export const getRoomDetail = (req, res) => {
  const { id } = req.params;
  const room = activeRooms.get(id);
  
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  
  res.json(room);
};

export const joinRoomApi = (req, res) => {
  // Real joining happens via Socket.io, this is just a stub to satisfy frontend REST call
  res.json({ success: true });
};
