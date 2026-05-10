import { fetchTracksByGenre } from '../services/musicService.js';
import { getUsers, saveUsers } from '../utils/db.js';

export const activeRooms = new Map();

// Helper to string comparison
const isCorrectAnswer = (guess, actual) => {
  if (!guess || !actual) return false;
  const g = guess.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const a = actual.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  // Very simple matching: if the guess is within the actual string or vice-versa
  return a.includes(g) && g.length > 3 || g === a;
};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, token, user }) => {
      socket.join(roomId);
      console.log(`User ${user?.username || socket.id} joined room ${roomId}`);

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          id: roomId,
          name: `Room ${roomId}`,
          host: user?.username || socket.id,
          genre: 'K-Pop', // Default genre for now
          players: [],
          tracks: [],
          currentRound: 0,
          totalRounds: 3,
          gameState: 'waiting',
          scores: []
        });
      }

      const room = activeRooms.get(roomId);
      
      // Add player if not exists
      if (!room.players.find(p => p.id === socket.id)) {
        room.players.push({
          id: socket.id,
          username: user?.username || 'Guest',
          avatar: user?.avatar || ''
        });
        
        room.scores.push({
          id: socket.id,
          username: user?.username || 'Guest',
          avatar: user?.avatar || '',
          score: 0
        });
      }

      // Tell everyone in the room about the updated scores/players
      io.to(roomId).emit('room-joined', {
        id: room.id,
        name: room.name,
        host: room.host,
        genre: room.genre,
        players: room.players
      });
      io.to(roomId).emit('score-update', { scores: room.scores });

      // Late Joiner Sync
      if (room.gameState === 'playing' && room.currentTrack) {
        socket.emit('game-start', { countdown: 0 }); // Skip countdown
        socket.emit('round-start', {
          roundNumber: room.currentRound,
          totalRounds: room.totalRounds,
          duration: 30, // Client calculates remaining time via startTimestamp
          startTimestamp: room.roundStart,
          audioUrl: room.currentTrack.audioUrl,
          coverArt: room.currentTrack.coverArt,
          hint: `This song is performed by ${room.currentTrack.artistName}`
        });
      }
    });

    socket.on('send-invite', ({ friendId, roomId }) => {
      io.to(friendId).emit('room-invite', {
        roomId,
        hostName: socket.user ? socket.user.name : 'A friend'
      });
    });

    socket.on('start-game', async ({ roomId }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.gameState === 'playing') return;

      room.gameState = 'playing';
      room.currentRound = 0;
      
      // Fetch tracks
      io.to(roomId).emit('game-start', { countdown: 5 });
      room.tracks = await fetchTracksByGenre(room.genre, room.totalRounds);
      
      setTimeout(() => startNextRound(roomId), 5000);
    });

    socket.on('submit-answer', ({ roomId, answer }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.gameState !== 'playing' || !room.currentTrack) return;

      if (isCorrectAnswer(answer, room.currentTrack.trackName)) {
        // Find player and award points based on time
        const elapsed = Math.floor((Date.now() - room.roundStart) / 1000);
        const timeRemaining = Math.max(30 - elapsed, 0);
        const points = 100 + (timeRemaining * 10); // Base 100 + time bonus
        
        const scoreEntry = room.scores.find(s => s.id === socket.id);
        if (scoreEntry && !room.answeredPlayers.has(socket.id)) {
          scoreEntry.score += points;
          room.answeredPlayers.add(socket.id);
          io.to(roomId).emit('score-update', { scores: room.scores });
        }
      }
    });

    const handlePlayerLeave = (socketId) => {
      // Find which rooms the player is in and remove them
      for (const [roomId, room] of activeRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.id === socketId);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            // Room is empty, clean it up completely
            activeRooms.delete(roomId);
            console.log(`Room ${roomId} deleted because it is empty.`);
          } else {
            // Re-assign host if the host left
            if (room.host === socketId) {
              room.host = room.players[0].username || room.players[0].id;
            }
            // Notify remaining players
            io.to(roomId).emit('room-joined', {
              ...room
            });
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
      const winnerId = sortedScores.length > 0 ? sortedScores[0].id : null;

      room.players.forEach(p => {
        // Try to match player by username or id if possible
        const userIndex = users.findIndex(u => u.username === p.username);
        if (userIndex !== -1) {
          const userScore = room.scores.find(s => s.id === p.id)?.score || 0;
          
          users[userIndex].gamesPlayed = (users[userIndex].gamesPlayed || 0) + 1;
          users[userIndex].score = (users[userIndex].score || 0) + userScore;
          
          if (winnerId === p.id) {
            users[userIndex].wins = (users[userIndex].wins || 0) + 1;
          }
          
          users[userIndex].winRate = Math.round(((users[userIndex].wins || 0) / users[userIndex].gamesPlayed) * 100);
          dbUpdated = true;
        }
      });

      if (dbUpdated) {
        saveUsers(users);
      }

      return;
    }

    room.currentRound++;
    room.currentTrack = room.tracks[room.currentRound - 1];
    
    if (!room.currentTrack) {
      room.gameState = 'ended';
      io.to(roomId).emit('game-end', { finalScores: room.scores });
      return;
    }

    room.roundStart = Date.now();
    room.answeredPlayers = new Set(); // Reset who answered this round

    io.to(roomId).emit('round-start', {
      roundNumber: room.currentRound,
      totalRounds: room.totalRounds,
      duration: 30,
      startTimestamp: room.roundStart,
      audioUrl: room.currentTrack.audioUrl,
      coverArt: room.currentTrack.coverArt,
      hint: `This song is performed by ${room.currentTrack.artistName}`
    });

    // End round after 30 seconds
    setTimeout(() => {
      if (room.gameState === 'playing') {
        io.to(roomId).emit('round-end', { correctAnswer: room.currentTrack.trackName });
        // Wait 5 seconds before next round
        setTimeout(() => startNextRound(roomId), 5000);
      }
    }, 30000);
  };
};
