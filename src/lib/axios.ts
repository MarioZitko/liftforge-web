import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token = Cookies.get("token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
