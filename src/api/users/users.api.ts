import BaseApi from "@/lib/base.api";
import type { RegisterRequest, User } from "./users.types";

class UsersApi extends BaseApi {
	constructor() {
		super("/users");
	}

	register(data: RegisterRequest): Promise<User> {
		// Registration usually happens via the auth module (adjust as needed)
		return this.axiosInstance
			.post<User>("/register", data)
			.then((res) => res.data);
	}

	getMe(): Promise<User> {
		return this.axiosInstance.get<User>("/me").then((res) => res.data);
	}

	// Optional: update user, get by ID, etc.
}

export const usersApi = new UsersApi();
