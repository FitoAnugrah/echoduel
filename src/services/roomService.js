import api from './api';
import { mockRooms } from './mockData';

const USE_MOCK = false;
let activeMockRooms = [...mockRooms];

/**
 * Normalize error messages from API responses into a consistent string.
 */
const getErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  return err?.response?.data?.message || err?.message || fallback;
};

export const getRooms = async (genre) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered =
          genre && genre !== 'All'
            ? activeMockRooms.filter((room) => room.genre === genre)
            : activeMockRooms;
        resolve(filtered);
      }, 300);
    });
  }

  try {
    const response = await api.get('/api/rooms', {
      params: genre && genre !== 'All' ? { genre } : {},
    });
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to fetch rooms.'));
  }
};

export const createRoom = async (data) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoom = {
          id: `room_${Date.now()}`,
          host: data.host,
          name: data.name,
          genre: data.genre,
          difficulty: data.difficulty,
          maxPlayers: data.maxPlayers,
          currentPlayers: 1,
          mode: 'Duel',
        };
        activeMockRooms = [newRoom, ...activeMockRooms];
        resolve(newRoom);
      }, 500);
    });
  }

  try {
    const response = await api.post('/api/rooms', data);
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to create room.'));
  }
};

export const joinRoom = async (roomId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const room = activeMockRooms.find((item) => item.id === roomId);
        resolve(room || null);
      }, 300);
    });
  }

  try {
    const response = await api.post(`/api/rooms/${roomId}/join`);
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to join room.'));
  }
};

export const getRoomDetail = async (roomId) => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const room = activeMockRooms.find((item) => item.id === roomId);
        resolve(room || null);
      }, 300);
    });
  }

  try {
    const response = await api.get(`/api/rooms/${roomId}`);
    return response.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Failed to fetch room details.'));
  }
};

export const fetchRooms = getRooms;