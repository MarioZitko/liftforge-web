import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { IApiBaseResponse } from "@/api/types";
// import { useNavigate } from "react-router-dom" ← used from component context

export default class BaseApi {
	protected axiosInstance: AxiosInstance;

	constructor(moduleBaseURL: string) {
		const baseURL = import.meta.env.VITE_API_BASE_URL + moduleBaseURL;

		this.axiosInstance = axios.create({
			baseURL,
			withCredentials: true,
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		this.axiosInstance.interceptors.response.use(
			(response: AxiosResponse) => response,
			(error: AxiosError<IApiBaseResponse>) => {
				const status = error.response?.status;

				if (status === 500) {
					// Optional: replace this with useNavigate() from inside a component
					console.error("Internal Server Error");
				} else if (status === 401 || status === 403) {
					console.warn("Unauthorized or Forbidden");
				} else {
					const errorMessage = error.response?.data.message;
					return Promise.reject(errorMessage);
				}

				return Promise.reject(error);
			}
		);
	}
}
