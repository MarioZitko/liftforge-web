import BaseApi from "@/lib/base.api";
import { User, CreateUserDto, UpdateUserDto } from "./users.types";
import { ApiSuccessResponse } from "@/api/types";

export default class UsersApiClient extends BaseApi {
	private static instance: UsersApiClient;

	private constructor() {
		super("/users");
	}

	public static getInstance() {
		if (!UsersApiClient.instance) {
			UsersApiClient.instance = new UsersApiClient();
		}
		return UsersApiClient.instance;
	}

	public async getAll(): Promise<User[]> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<User[]>>("/");
		return res.data.data;
	}

	public async delete(id: string): Promise<void> {
		await this.axiosInstance.delete(`/${id}`);
	}

	public async create(data: CreateUserDto): Promise<User> {
		const res = await this.axiosInstance.post<ApiSuccessResponse<User>>(
			"/",
			data
		);
		return res.data.data;
	}

	public async update(id: string, data: UpdateUserDto): Promise<User> {
		const res = await this.axiosInstance.put<ApiSuccessResponse<User>>(
			`/${id}`,
			data
		);
		return res.data.data;
	}
}
