import axios from "axios";

const API_URL: string = "http://backend:3000"

const getToken = () => localStorage.getItem("token")

const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

export default api