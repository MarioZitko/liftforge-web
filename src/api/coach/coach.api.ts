import { ApiSuccessResponse, GenericMessageResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import { Client } from "../client/client.types";
import {
  Coach,
  CreateCoachDto,
  InviteClientDto,
  UpdateCoachDto,
} from "./coach.types";

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

  public async getById(id: string): Promise<Coach> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Coach>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async getByUserId(id: string): Promise<Coach> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Coach>>(
      `/user/${id}`
    );
    return res.data.data;
  }

  public async getAll(): Promise<Coach[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Coach[]>>("/");
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
}
