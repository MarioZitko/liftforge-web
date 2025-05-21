export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	role: "COACH" | "CLIENT";
}

export interface User {
	id: number;
	email: string;
	name: string;
	role: "COACH" | "CLIENT" | "ADMIN";
}
