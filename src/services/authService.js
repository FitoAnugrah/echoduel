import api from './api';

export const loginUser = async(credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
};

export const registerUser = async(userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};

export const fetchCurrentUser = async() => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

export const updateProfile = async(profileData) => {
    const USE_MOCK = false;
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ user: {...profileData } });
            }, 500);
        });
    }

    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
};

export const changePassword = async(passwordData) => {
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

    const response = await api.put('/api/auth/password', passwordData);
    return response.data;
};