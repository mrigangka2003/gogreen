import axios from "axios";
import { useAuthStore } from "../stores/auth";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// Attach JWT token from store on every request
axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
