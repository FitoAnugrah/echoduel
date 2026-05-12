import { fetchTracks } from '../services/musicService.js';
import { getUsers, saveUsers } from '../utils/db.js';

export const activeRooms = new Map();

// ─── Answer matching with difficulty-aware tolerance ──────────────────────────

const normalizeString = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
};

/**
 * Check if the guess matches the actual answer.
 * Tolerance depends on difficulty:
 *   Easy   — substring match (70%), up to 3 typos
 *   Medium — substring match (80%), up to 2 typos
 *   Hard   — exact match or up to 1 typo (length > 6 only)
 */
const isCorrectAnswer = (guess, actual, difficulty = 'Easy') => {
  if (!guess || !actual) return false;
  const g = normalizeString(guess);
  const a = normalizeString(actual);
  
  // Exact match always counts
  if (g === a) return true;
  
  if (difficulty === 'Hard') {
    // Hard: only allow 1 typo for words longer than 6 chars
    if (g.length === a.length && a.length > 6) {
      let diff = 0;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== g[i]) diff++;
      }
      if (diff <= 1) return true;
    }
    return false;
  }
  
  if (difficulty === 'Medium') {
    // Medium: substring match (80% of answer length), up to 2 typos
    if (a.includes(g) && g.length >= a.length * 0.8) return true;
    if (g.length === a.length && a.length > 4) {
      let diff = 0;
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== g[i]) diff++;
      }
      if (diff <= 2) return true;
    }
    return false;
  }
  
  // Easy: substring match (70% of answer length), up to 3 typos
  if (a.includes(g) && g.length >= a.length * 0.7) return true;
  if (g.length === a.length && a.length > 4) {
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== g[i]) diff++;
    }
    if (diff <= 3) return true;
  }
  
  return false;
};

// ─── Room timer management ───────────────────────────────────────────────────

const roomTimers = new Map();

const clearRoomTimers = (roomId) => {
  const timers = roomTimers.get(roomId);
  if (timers) {
    timers.forEach(clearTimeout);
    roomTimers.delete(roomId);
  }
};

const addRoomTimer = (roomId, timerId) => {
  if (!roomTimers.has(roomId)) roomTimers.set(roomId, []);
  roomTimers.get(roomId).push(timerId);
};

// ─── Socket handlers ─────────────────────────────────────────────────────────

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, token, fallbackName, fallbackGenre, fallbackDifficulty }) => {
      // User identity is taken from the verified JWT on the socket, NOT from client-sent user object
      const verifiedUser = socket.user;

      // If room doesn't exist (e.g. direct URL access), create a fallback
      if (!activeRooms.has(roomId)) {
        console.warn(`⚠️ FALLBACK TRIGGERED! Room ${roomId} was not found in memory. Recreating it.`);
        activeRooms.set(roomId, {
          id: roomId,
          name: fallbackName || `Room ${roomId}`,
          host: verifiedUser?.username || socket.id,
          hostId: verifiedUser?.id || socket.id,
          genre: fallbackGenre || 'Pop Indo',
          difficulty: fallbackDifficulty || 'Easy',
          maxPlayers: 2,
          roundDuration: 30,
          players: [],
          tracks: [],
          currentRound: 0,
          totalRounds: 3,
          gameState: 'waiting',
          scores: []
        });
      }

      const room = activeRooms.get(roomId);

      // Enforce maxPlayers — reject if room is full (unless player is already in)
      const alreadyInRoom = room.players.find(p => p.id === socket.id || p.userId === verifiedUser?.id);
      if (!alreadyInRoom && room.players.length >= (room.maxPlayers || 2)) {
        socket.emit('game-error', { message: 'Room is full.' });
        return;
      }

      socket.join(roomId);
      console.log(`User ${verifiedUser?.username || socket.id} joined room ${roomId}`);
      
      // Add player if not already in room (use socket.id as unique key)
      if (!room.players.find(p => p.id === socket.id)) {
        room.players.push({
          id: socket.id,
          userId: verifiedUser?.id || null,
          username: verifiedUser?.username || 'Guest',
          avatar: verifiedUser?.avatar || ''
        });
        
        room.scores.push({
          id: socket.id,
          userId: verifiedUser?.id || null,
          username: verifiedUser?.username || 'Guest',
          avatar: verifiedUser?.avatar || '',
          score: 0
        });
      }

      // Tell everyone in the room about the updated scores/players
      io.to(roomId).emit('room-joined', {
        id: room.id,
        name: room.name,
        host: room.host,
        genre: room.genre,
        difficulty: room.difficulty,
        players: room.players,
        gameState: room.gameState,
      });
      io.to(roomId).emit('score-update', { scores: room.scores });

      // Late Joiner Sync
      if (room.gameState === 'playing' && room.currentTrack) {
        const duration = room.roundDuration || 30;
        socket.emit('game-start', { countdown: 0 }); // Skip countdown
        socket.emit('round-start', {
          roundNumber: room.currentRound,
          totalRounds: room.totalRounds,
          duration,
          startTimestamp: room.roundStart,
          audioUrl: room.currentTrack.audioUrl,
          coverArt: room.currentTrack.coverArt,
          hint: room.difficulty === 'Hard'
            ? 'No hints in Hard mode!'
            : `This song is performed by ${room.currentTrack.artistName}`
        });
      }
    });

    socket.on('send-invite', ({ friendId, roomId }) => {
      io.to(friendId).emit('room-invite', {
        roomId,
        hostName: socket.user ? (socket.user.name || socket.user.username) : 'A friend'
      });
    });

    socket.on('start-game', async ({ roomId }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.gameState === 'playing') return;

      // Only the host can start the game
      const requesterId = socket.user?.id || socket.id;
      const isHost = room.hostId === requesterId || room.host === socket.user?.username;
      if (!isHost) {
        socket.emit('game-error', { message: 'Only the host can start the game.' });
        return;
      }

      room.gameState = 'playing';
      room.currentRound = 0;
      
      // Fetch tracks based on genre and number of rounds
      io.to(roomId).emit('game-start', { countdown: 5 });
      try {
        console.log(`Backend Processing (Start Game): Genre=${room.genre}, Diff=${room.difficulty}, RoomID=${roomId}`);
        room.tracks = await fetchTracks(room.genre, room.difficulty, room.totalRounds);
      } catch (err) {
        io.to(roomId).emit('game-error', { message: err.message });
        room.gameState = 'waiting'; // Reset state so they can try again
        io.to(roomId).emit('room-joined', {
          id: room.id,
          name: room.name,
          host: room.host,
          genre: room.genre,
          difficulty: room.difficulty,
          players: room.players,
          gameState: room.gameState,
        });
        return;
      }
      
      const startTimer = setTimeout(() => startNextRound(roomId), 5000);
      addRoomTimer(roomId, startTimer);
    });

    socket.on('submit-answer', ({ roomId, answer }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.gameState !== 'playing' || !room.currentTrack) return;

      const correct = isCorrectAnswer(answer, room.currentTrack.trackName, room.difficulty);

      if (correct) {
        const duration = room.roundDuration || 30;
        const elapsed = Math.floor((Date.now() - room.roundStart) / 1000);
        const timeRemaining = Math.max(duration - elapsed, 0);
        const points = 100 + (timeRemaining * 10); // Base 100 + time bonus
        
        const scoreEntry = room.scores.find(s => s.id === socket.id);
        if (scoreEntry && room.answeredPlayers && !room.answeredPlayers.has(socket.id)) {
          scoreEntry.score += points;
          room.answeredPlayers.add(socket.id);
          io.to(roomId).emit('score-update', { scores: room.scores });
          socket.emit('answer-result', { correct: true, points });
        } else {
          // Already answered this round
          socket.emit('answer-result', { correct: true, points: 0, alreadyAnswered: true });
        }
      } else {
        socket.emit('answer-result', { correct: false, points: 0 });
      }
    });

    const handlePlayerLeave = (socketId) => {
      for (const [roomId, room] of activeRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.id === socketId);
        if (playerIndex !== -1) {
          const leavingPlayer = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          // Also remove from scores
          const scoreIndex = room.scores.findIndex(s => s.id === socketId);
          if (scoreIndex !== -1) room.scores.splice(scoreIndex, 1);

          if (room.players.length === 0) {
            // Room is empty — clean up completely
            clearRoomTimers(roomId);
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} deleted because it is empty.`);
          } else {
            // Re-assign host if the host left — use username, not socketId
            const wasHost = room.hostId === leavingPlayer.userId || room.host === leavingPlayer.username;
            if (wasHost) {
              const newHost = room.players[0];
              room.host = newHost.username;
              room.hostId = newHost.userId || newHost.id;
              console.log(`Host of room ${roomId} reassigned to ${room.host}`);
            }
            // Notify remaining players with updated room state
            io.to(roomId).emit('room-joined', {
              id: room.id,
              name: room.name,
              host: room.host,
              genre: room.genre,
              difficulty: room.difficulty,
              players: room.players,
              gameState: room.gameState,
            });
            io.to(roomId).emit('score-update', { scores: room.scores });
          }
        }
      }
    };

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
      handlePlayerLeave(socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handlePlayerLeave(socket.id);
    });
  });

  const startNextRound = (roomId) => {
    const room = activeRooms.get(roomId);
    if (!room) return;

    if (room.currentRound >= room.totalRounds) {
      room.gameState = 'ended';
      io.to(roomId).emit('game-end', { finalScores: room.scores });
      
      // Update User Stats in Database
      const users = getUsers();
      let dbUpdated = false;

      // Sort scores to find the winner
      const sortedScores = [...room.scores].sort((a, b) => b.score - a.score);
      const winnerSocketId = sortedScores.length > 0 ? sortedScores[0].id : null;

      room.players.forEach(p => {
        // Match by userId (stored from JWT) — more reliable than username
        const userIndex = p.userId
          ? users.findIndex(u => u.id === p.userId)
          : users.findIndex(u => u.username === p.username);

        if (userIndex !== -1) {
          const userScore = room.scores.find(s => s.id === p.id)?.score || 0;
          
          users[userIndex].gamesPlayed = (users[userIndex].gamesPlayed || 0) + 1;
          users[userIndex].score = (users[userIndex].score || 0) + userScore;
          
          if (winnerSocketId === p.id) {
            users[userIndex].wins = (users[userIndex].wins || 0) + 1;
          }
          
          users[userIndex].winRate = Math.round(((users[userIndex].wins || 0) / users[userIndex].gamesPlayed) * 100);
          dbUpdated = true;
        }
      });

      if (dbUpdated) {
        saveUsers(users);
      }

      // Clean up timers for this room
      clearRoomTimers(roomId);
      return;
    }

    room.currentRound++;
    room.currentTrack = room.tracks[room.currentRound - 1];
    
    if (!room.currentTrack) {
      room.gameState = 'ended';
      io.to(roomId).emit('game-end', { finalScores: room.scores });
      clearRoomTimers(roomId);
      return;
    }

    const duration = room.roundDuration || 30;
    room.roundStart = Date.now();
    room.answeredPlayers = new Set(); // Reset who answered this round

    io.to(roomId).emit('round-start', {
      roundNumber: room.currentRound,
      totalRounds: room.totalRounds,
      duration,
      startTimestamp: room.roundStart,
      audioUrl: room.currentTrack.audioUrl,
      coverArt: room.currentTrack.coverArt,
      hint: room.difficulty === 'Hard'
        ? 'No hints in Hard mode!'
        : `This song is performed by ${room.currentTrack.artistName}`
    });

    // End round after duration seconds
    const roundTimer = setTimeout(() => {
      const currentRoom = activeRooms.get(roomId);
      if (!currentRoom || currentRoom.gameState !== 'playing') return;

      io.to(roomId).emit('round-end', { correctAnswer: currentRoom.currentTrack.trackName });

      // Wait 5 seconds before next round
      const nextRoundTimer = setTimeout(() => startNextRound(roomId), 5000);
      addRoomTimer(roomId, nextRoundTimer);
    }, duration * 1000);

    addRoomTimer(roomId, roundTimer);
  };
};
