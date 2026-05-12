import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Attach token otomatis di setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('echoduel_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Kalau 401 atau 403, logout otomatis (token missing atau invalid/expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // 401 = no token, 403 = token expired/invalid
        if (status === 401 || status === 403) {
            const token = localStorage.getItem('echoduel_token');
            // Only force logout if user had a token (avoid redirect loops on public pages)
            if (token) {
                localStorage.removeItem('echoduel_token');
                localStorage.removeItem('echoduel_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)

export default api