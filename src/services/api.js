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

// Kalau 401, logout otomatis
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('echoduel_token')
            localStorage.removeItem('echoduel_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api