import BaseApi from "@/lib/base.api";
import {
	Coach,
	CreateCoachDto,
	UpdateCoachDto,
	InviteClientDto,
	CoachWithDetailsDto,
} from "./coach.types";
import { ApiSuccessResponse, GenericMessageResponse } from "@/api/types";
import { Client } from "../client/client.types";

export default class CoachesApiClient extends BaseApi {
	private static instance: CoachesApiClient;

	private constructor() {
		super("/coach");
	}

	public static getInstance() {
		if (!CoachesApiClient.instance) {
			CoachesApiClient.instance = new CoachesApiClient();
		}
		return CoachesApiClient.instance;
	}

	public async getAll(): Promise<CoachWithDetailsDto[]> {
		const res = await this.axiosInstance.get<
			ApiSuccessResponse<CoachWithDetailsDto[]>
		>("/");
		return res.data.data;
	}

	public async delete(id: string): Promise<void> {
		await this.axiosInstance.delete(`/${id}`);
	}

	public async create(data: CreateCoachDto): Promise<Coach> {
		const res = await this.axiosInstance.post<ApiSuccessResponse<Coach>>(
			"/",
			data
		);
		return res.data.data;
	}

	public async update(id: string, data: UpdateCoachDto): Promise<Coach> {
		const res = await this.axiosInstance.put<ApiSuccessResponse<Coach>>(
			`/${id}`,
			data
		);
		return res.data.data;
	}

	public async getCoachClients(id: string): Promise<Client[]> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<Client[]>>(
			`/${id}/clients`
		);
		return res.data.data;
	}

	public async inviteClient(
		data: InviteClientDto
	): Promise<GenericMessageResponse> {
		const res = await this.axiosInstance.post<
			ApiSuccessResponse<GenericMessageResponse>
		>("/invite-client", data);
		return res.data.data;
	}

	public async getAvailableCoachesWithClientCount(): Promise<
		CoachWithDetailsDto[]
	> {
		const res = await this.axiosInstance.get<
			ApiSuccessResponse<CoachWithDetailsDto[]>
		>("/available");
		return res.data.data;
	}
}
