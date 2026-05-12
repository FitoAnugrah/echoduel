import api from './api';

const normalizeError = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Login failed.'));
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Registration failed.'));
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to fetch user.'));
  }
};

export const updateProfile = async (profileData) => {
  const USE_MOCK = false;
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ user: { ...profileData } }), 500);
    });
  }

  try {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to update profile.'));
  }
};

export const changePassword = async (passwordData) => {
  const USE_MOCK = false;
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          reject(new Error('New password and confirmation do not match.'));
        } else if (!passwordData.currentPassword || !passwordData.newPassword) {
          reject(new Error('Please fill in all password fields.'));
        } else {
          resolve({ success: true });
        }
      }, 500);
    });
  }

  try {
    const response = await api.put('/api/auth/password', passwordData);
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err, 'Failed to change password.'));
  }
};
