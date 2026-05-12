import api from './api';
import { mockLeaderboard } from './mockData';

const USE_MOCK = false;

export const fetchLeaderboard = async () => {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLeaderboard), 400);
    });
  }

  try {
    const response = await api.get('/api/leaderboard');
    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch leaderboard.');
  }
};
