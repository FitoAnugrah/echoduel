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
      online: Math.random() > 0.5,
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
    text,
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
