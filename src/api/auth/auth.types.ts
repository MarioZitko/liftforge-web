// api/auth/auth.types.ts

// ✅ REQUEST TYPES (what you send to the server)

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role?: string;
}

export interface RefreshTokenRequest {
	email: string;
	refreshToken: string;
}

export interface RequestPasswordResetRequest {
	email: string;
}

export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
}

export interface RequestEmailVerificationRequest {
	email: string;
}

export interface VerifyEmailRequest {
	token: string;
}

// ✅ RESPONSE TYPES (what you get in `data:` inside ApiSuccessResponse<T>)

export interface LoginResponse {
	accessToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
}

export interface GetMeResponse {
	userId: string;
	email: string;
	role: string;
	message?: string;
}
