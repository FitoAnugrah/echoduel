import api from './api';
import { mockRooms } from './mockData';

const USE_MOCK = false;
let activeMockRooms = [...mockRooms];

export const getRooms = async(genre) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = genre && genre !== 'All' ?
                    activeMockRooms.filter((room) => room.genre === genre) :
                    activeMockRooms;
                resolve(filtered);
            }, 300);
        });
    }

    const response = await api.get('/api/rooms', {
        params: genre && genre !== 'All' ? { genre } : {},
    });
    return response.data;
};

export const createRoom = async(data) => {
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

    const response = await api.post('/api/rooms', data);
    return response.data;
};

export const joinRoom = async(roomId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const room = activeMockRooms.find((item) => item.id === roomId);
                resolve(room || null);
            }, 300);
        });
    }

    const response = await api.post(`/api/rooms/${roomId}/join`);
    return response.data;
};

export const getRoomDetail = async(roomId) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const room = activeMockRooms.find((item) => item.id === roomId);
                resolve(room || null);
            }, 300);
        });
    }

    const response = await api.get(`/api/rooms/${roomId}`);
    return response.data;
};

export const fetchRooms = getRooms;