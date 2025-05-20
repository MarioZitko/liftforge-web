// src/lib/base.api.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import type { ApiErrorResponse } from "@/api/types";

export default class BaseApi {
	protected axiosInstance: AxiosInstance;

	constructor(resourcePath: string) {
		const baseURL = import.meta.env.VITE_API_BASE_URL + resourcePath;

		this.axiosInstance = axios.create({
			baseURL,
			withCredentials: true, // for cookies or token handling
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		this.axiosInstance.interceptors.response.use(
			(response: AxiosResponse) => response,
			(error: AxiosError<ApiErrorResponse>) => {
				const status = error.response?.status;
				const data = error.response?.data;

				switch (status) {
					case 401:
						console.warn("Unauthorized. You may be logged out.");
						break;
					case 403:
						console.warn("Forbidden. Insufficient permissions.");
						break;
					case 500:
						console.error("Internal Server Error");
						break;
					default:
						// Unhandled status
						break;
				}

				// Reject with detailed API error if possible
				return Promise.reject(data ?? error);
			}
		);
	}
}
