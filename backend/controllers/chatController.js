import { getChats, saveChats, getUsers } from '../utils/db.js';

export const getConversations = (req, res) => {
  const userId = req.user.id;
  const chats = getChats();
  const users = getUsers();

  const userChats = chats.filter(c => c.participants.includes(userId));
  
  const conversations = userChats.map(chat => {
    const otherUserId = chat.participants.find(id => id !== userId);
    const otherUser = users.find(u => u.id === otherUserId) || {};
    const lastMessage = chat.messages[chat.messages.length - 1];

    return {
      id: chat.id,
      friendId: otherUserId,
      name: otherUser.name,
      avatar: otherUser.avatar,
      online: true,
      lastMessage: lastMessage ? lastMessage.text : 'Start a conversation...',
      time: lastMessage ? lastMessage.timestamp : '',
      unread: 0
    };
  });

  res.json(conversations);
};

export const getMessages = (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;

  // Validate friendId is a real user
  const users = getUsers();
  const friendExists = users.find(u => u.id === friendId);
  if (!friendExists) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const chats = getChats();
  const chat = chats.find(c => c.participants.includes(userId) && c.participants.includes(friendId));
  
  if (!chat) return res.json([]);

  const messagesWithOwnership = chat.messages.map(msg => ({
    ...msg,
    isOwn: msg.senderId === userId
  }));

  res.json(messagesWithOwnership);
};

export const sendMessage = (req, res) => {
  const { friendId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  // Validate message text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ message: 'Message text cannot be empty.' });
  }

  if (text.trim().length > 1000) {
    return res.status(400).json({ message: 'Message is too long (max 1000 characters).' });
  }

  // Validate that friendId is a real user
  const users = getUsers();
  const friend = users.find(u => u.id === friendId);
  if (!friend) {
    return res.status(404).json({ message: 'Recipient user not found.' });
  }

  // Validate friendship — only friends can message each other
  const sender = users.find(u => u.id === userId);
  const isFriend = sender && (sender.friends || []).includes(friendId);
  if (!isFriend) {
    return res.status(403).json({ message: 'You can only send messages to friends.' });
  }
  
  const chats = getChats();
  let chat = chats.find(c => c.participants.includes(userId) && c.participants.includes(friendId));

  if (!chat) {
    chat = {
      id: `chat_${Date.now()}`,
      participants: [userId, friendId],
      messages: []
    };
    chats.push(chat);
  }

  const newMessage = {
    id: `msg_${Date.now()}`,
    senderId: userId,
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  chat.messages.push(newMessage);
  saveChats(chats);

  // Real-time emission
  const io = req.app.get('io');
  if (io) {
    io.to(friendId).emit('new-message', {
      ...newMessage,
      senderId: userId
    });
  }

  res.status(201).json({ ...newMessage, isOwn: true });
};
