import Cookies from "js-cookie";
import BaseApi from "@/lib/base.api";
import type { LoginRequest, LoginResponse } from "./auth.types";

class AuthApi extends BaseApi {
	constructor() {
		super("/auth");
	}

	async login(data: LoginRequest): Promise<LoginResponse> {
		const res = await this.axiosInstance.post<LoginResponse>("/login", data);
		Cookies.set("token", res.data.access_token);
		return res.data;
	}

	logout() {
		Cookies.remove("token");
		window.location.href = "/login";
	}
}

export const authApi = new AuthApi();
