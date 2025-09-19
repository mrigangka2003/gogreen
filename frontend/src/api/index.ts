import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_API_URL;

const axiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10_000, 
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export default axiosInstance;
