import { activeRooms } from './gameController.js';

export const getRooms = (req, res) => {
  const { genre } = req.query;
  const rooms = Array.from(activeRooms.values()).map(room => ({
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
  const { host, name, genre, difficulty, maxPlayers } = req.body;
  const roomId = `room_${Date.now()}`;
  
  activeRooms.set(roomId, {
    id: roomId,
    name: name || `${genre} Room`,
    host: host || 'Player',
    genre: genre || 'Pop Indo',
    difficulty: difficulty || 'Easy',
    maxPlayers: parseInt(maxPlayers) || 2,
    players: [],
    tracks: [],
    currentRound: 0,
    totalRounds: 3,
    gameState: 'waiting',
    scores: []
  });

  res.status(201).json({
    id: roomId,
    name,
    host,
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
