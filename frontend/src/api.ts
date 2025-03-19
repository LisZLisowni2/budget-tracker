import axios from "axios";

const API_URL: string = "https://localhost/api/"

const getToken = () => localStorage.getItem("token")

const isLocalHost = window.location.hostname === "localhost"

console.log(isLocalHost)

const api = axios.create({
    baseURL: API_URL,
    withCredentials: isLocalHost
})

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

export default api