import api from './api';
import { mockLeaderboard } from './mockData';

const USE_MOCK = false;

export const fetchLeaderboard = async() => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockLeaderboard), 400);
        });
    }

    const response = await api.get('/api/leaderboard');
    return response.data;
};