// src/api/auth/auth.api.ts
import BaseApi from "@/lib/base.api";
import {
	LoginRequest,
	RegisterRequest,
	RefreshTokenRequest,
	GetMeResponse,
	RequestPasswordResetRequest,
	ResetPasswordRequest,
	RequestEmailVerificationRequest,
	VerifyEmailRequest,
} from "./auth.types";
import { ApiSuccessResponse, GenericMessageResponse } from "../types";

export default class AuthApiClient extends BaseApi {
	private static instance: AuthApiClient;

	private constructor() {
		super("/auth");
	}

	public static getInstance() {
		if (!AuthApiClient.instance) {
			AuthApiClient.instance = new AuthApiClient();
		}
		return AuthApiClient.instance;
	}

	public async getMe(): Promise<ApiSuccessResponse<GetMeResponse>> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<GetMeResponse>>(
			"/me"
		);
		return res.data;
	}

	public async login(
		data: LoginRequest
	): Promise<ApiSuccessResponse<{ message: string }>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<{ message: string }>
		>("/login", data);
		return res.data;
	}

	public async register(
		data: RegisterRequest
	): Promise<ApiSuccessResponse<GenericMessageResponse>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/register", data);
		return res.data;
	}

	public async refreshToken(
		data: RefreshTokenRequest
	): Promise<ApiSuccessResponse<{ accessToken: string }>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<{ accessToken: string }>
		>("/refresh", data);
		return res.data;
	}

	public async requestPasswordReset(
		data: RequestPasswordResetRequest
	): Promise<ApiSuccessResponse<GenericMessageResponse>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/request-password-reset", data);
		return res.data;
	}

	public async resetPassword(
		data: ResetPasswordRequest
	): Promise<ApiSuccessResponse<GenericMessageResponse>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/reset-password", data);
		return res.data;
	}

	public async requestEmailVerification(
		data: RequestEmailVerificationRequest
	): Promise<ApiSuccessResponse<GenericMessageResponse>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/request-email-verification", data);
		return res.data;
	}

	public async verifyEmail(
		data: VerifyEmailRequest
	): Promise<ApiSuccessResponse<GenericMessageResponse>> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/verify-email", data);
		return res.data;
	}

	public async logout(): Promise<void> {
		await this.axiosInstance.post("/logout");
		window.location.href = "/login";
	}
}
