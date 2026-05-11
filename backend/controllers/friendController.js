import { getUsers, saveUsers } from '../utils/db.js';

export const getAllUsers = (req, res) => {
  const users = getUsers();
  const userId = req.user.id;
  // Return users except self, exclude passwords
  const publicUsers = users.filter(u => u.id !== userId).map(({ password, ...u }) => u);
  res.json(publicUsers);
};

export const getFriends = (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Map friend IDs to user objects
  const friendList = (user.friends || []).map(friendId => {
    const f = users.find(u => u.id === friendId);
    return f ? { id: f.id, name: f.name, username: f.username, avatar: f.avatar, online: true } : null;
  }).filter(Boolean);

  res.json(friendList);
};

export const getFriendRequests = (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.user.id);
  
  const incoming = (user.incomingRequests || []).map(id => {
    const u = users.find(x => x.id === id);
    return u ? { id: u.id, name: u.name, username: u.username, avatar: u.avatar } : null;
  }).filter(Boolean);

  const outgoing = (user.outgoingRequests || []).map(id => {
    const u = users.find(x => x.id === id);
    return u ? { id: u.id, name: u.name, username: u.username, avatar: u.avatar } : null;
  }).filter(Boolean);

  res.json({ incoming, outgoing });
};

export const sendFriendRequest = (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.id;
  const users = getUsers();
  
  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);

  if (!friend) return res.status(404).json({ message: 'User not found' });

  if (!user.outgoingRequests) user.outgoingRequests = [];
  if (!friend.incomingRequests) friend.incomingRequests = [];

  if (!user.outgoingRequests.includes(friendId)) {
    user.outgoingRequests.push(friendId);
    friend.incomingRequests.push(userId);
    saveUsers(users);
  }

  res.json({ message: 'Friend request sent' });
};

export const acceptFriendRequest = (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.id;
  const users = getUsers();
  
  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);

  if (!friend) return res.status(404).json({ message: 'User not found' });

  if (!user.friends) user.friends = [];
  if (!friend.friends) friend.friends = [];

  // Remove from requests
  user.incomingRequests = (user.incomingRequests || []).filter(id => id !== friendId);
  friend.outgoingRequests = (friend.outgoingRequests || []).filter(id => id !== userId);

  // Add to friends
  if (!user.friends.includes(friendId)) user.friends.push(friendId);
  if (!friend.friends.includes(userId)) friend.friends.push(userId);

  saveUsers(users);
  res.json({ message: 'Friend request accepted' });
};

export const declineFriendRequest = (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;
  const users = getUsers();
  
  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);

  if (!friend) return res.status(404).json({ message: 'User not found' });

  user.incomingRequests = (user.incomingRequests || []).filter(id => id !== friendId);
  friend.outgoingRequests = (friend.outgoingRequests || []).filter(id => id !== userId);

  saveUsers(users);
  res.json({ message: 'Friend request declined' });
};

export const cancelFriendRequest = (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;
  const users = getUsers();
  
  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);

  if (!friend) return res.status(404).json({ message: 'User not found' });

  user.outgoingRequests = (user.outgoingRequests || []).filter(id => id !== friendId);
  friend.incomingRequests = (friend.incomingRequests || []).filter(id => id !== userId);

  saveUsers(users);
  res.json({ message: 'Friend request cancelled' });
};
