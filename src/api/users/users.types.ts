export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface User {
	id: number;
	email: string;
	name: string;
	role: "coach" | "client" | "admin";
}
