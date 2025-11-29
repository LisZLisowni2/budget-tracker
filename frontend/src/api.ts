import axios, { AxiosInstance } from 'axios';

const API_URL: string =
    import.meta.env.VITE_API_URL || 'https://localhost/api/';

const getToken = () => localStorage.getItem('token');

const isLocalHost = window.location.hostname === 'localhost';
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: isLocalHost,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
