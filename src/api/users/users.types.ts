export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	role: "COACH" | "CLIENT";
}

export type Role = "CLIENT" | "COACH" | "ADMIN";

export interface User {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	emailVerified: boolean;
	createdAt: string;
}

export interface CreateUserDto {
	email: string;
	password: string;
	name?: string;
	role: Role;
}

export interface UpdateUserDto {
	email?: string;
	name?: string;
	role?: Role;
	password?: string;
}

export type FormUserData = {
	email: string;
	name?: string;
	password?: string;
	role: Role;
};
