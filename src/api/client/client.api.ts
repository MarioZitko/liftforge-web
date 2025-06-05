import BaseApi from "@/lib/base.api";
import {
	Client,
	CreateClientDto,
	UpdateClientDto,
	ClientProgram,
} from "./client.types";
import { ApiSuccessResponse } from "@/api/types";

export default class ClientsApiClient extends BaseApi {
	private static instance: ClientsApiClient;

	private constructor() {
		super("/client");
	}

	public static getInstance() {
		if (!ClientsApiClient.instance) {
			ClientsApiClient.instance = new ClientsApiClient();
		}
		return ClientsApiClient.instance;
	}

	public async getAll(): Promise<Client[]> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<Client[]>>("/");
		return res.data.data;
	}

	public async delete(id: string): Promise<void> {
		await this.axiosInstance.delete(`/${id}`);
	}

	public async create(data: CreateClientDto): Promise<Client> {
		const res = await this.axiosInstance.post<ApiSuccessResponse<Client>>(
			"/",
			data
		);
		return res.data.data;
	}

	public async update(id: string, data: UpdateClientDto): Promise<Client> {
		const res = await this.axiosInstance.put<ApiSuccessResponse<Client>>(
			`/${id}`,
			data
		);
		return res.data.data;
	}

	public async getClientPrograms(id: string): Promise<ClientProgram[]> {
		const res = await this.axiosInstance.get<
			ApiSuccessResponse<ClientProgram[]>
		>(`/${id}/programs`);
		return res.data.data;
	}
}
