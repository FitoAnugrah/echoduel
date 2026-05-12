import api from './api';
import { mockUsers, mockFriends, mockFriendRequests, mockConversations, mockChatHistory } from './mockData';

const USE_MOCK = false;
let friends = [...mockFriends];
let incomingRequests = [...mockFriendRequests.incoming];
let outgoingRequests = [...mockFriendRequests.outgoing];

const normalizeError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const searchUsers = async (query) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }

  try {
    const response = await api.get('/api/friends/all');
    return response.data.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to search users.'));
  }
};

export const getFriends = async () => {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(friends), 300));
  }

  try {
    const response = await api.get('/api/friends');
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to fetch friends.'));
  }
};

export const sendRequest = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!outgoingRequests.find((req) => req.id === userId)) {
          const user = mockUsers.find((item) => item.id === userId);
          if (user) outgoingRequests.push({ ...user, status: 'pending' });
        }
        resolve({ success: true });
      }, 300);
    });
  }

  try {
    const response = await api.post('/api/friends/request', { friendId: userId });
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to send friend request.'));
  }
};

export const getFriendRequests = async () => {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ incoming: incomingRequests, outgoing: outgoingRequests }), 300)
    );
  }

  try {
    const response = await api.get('/api/friends/requests');
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to fetch friend requests.'));
  }
};

export const acceptRequest = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const requestIndex = incomingRequests.findIndex((req) => req.id === userId);
        if (requestIndex !== -1) {
          const [request] = incomingRequests.splice(requestIndex, 1);
          friends.push({ ...request, online: true, score: 7900 });
        }
        resolve({ success: true });
      }, 300);
    });
  }

  try {
    const response = await api.post('/api/friends/accept', { friendId: userId });
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to accept friend request.'));
  }
};

export const declineRequest = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        incomingRequests = incomingRequests.filter((req) => req.id !== userId);
        resolve({ success: true });
      }, 300);
    });
  }

  try {
    const response = await api.delete(`/api/friends/decline/${userId}`);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to decline friend request.'));
  }
};

export const cancelRequest = async (userId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        outgoingRequests = outgoingRequests.filter((req) => req.id !== userId);
        resolve({ success: true });
      }, 300);
    });
  }

  try {
    const response = await api.delete(`/api/friends/request/${userId}`);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to cancel friend request.'));
  }
};

export const getConversations = async () => {
  if (USE_MOCK) {
    return new Promise((resolve) => setTimeout(() => resolve(mockConversations), 300));
  }

  try {
    const response = await api.get('/api/chat/conversations');
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to fetch conversations.'));
  }
};

export const getChatHistory = async (friendId) => {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockChatHistory[friendId] || []), 300)
    );
  }

  try {
    const response = await api.get(`/api/chat/${friendId}`);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to fetch chat history.'));
  }
};

export const sendMessage = async (friendId, text) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMsg = {
          id: `msg_${Date.now()}`,
          senderName: 'You',
          message: text,
          timestamp: new Date().toLocaleTimeString(),
          isSent: true,
        };
        resolve(newMsg);
      }, 300);
    });
  }

  try {
    const response = await api.post(`/api/chat/${friendId}`, { text });
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to send message.'));
  }
};
