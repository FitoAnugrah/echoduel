import { getUsers } from '../utils/db.js';

export const getLeaderboard = (req, res) => {
  const users = getUsers();
  
  // Sort by score descending
  const sortedUsers = [...users].sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // Take top 50
  const topUsers = sortedUsers.slice(0, 50).map((u, index) => ({
    id: u.id,
    rank: index + 1,
    name: u.name,
    username: u.username,
    avatar: u.avatar,
    score: u.score || 0,
    winRate: u.winRate || 0,
    gamesPlayed: u.gamesPlayed || 0
  }));

  res.json(topUsers);
};
