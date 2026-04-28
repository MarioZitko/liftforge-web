import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  ClientProgramAssignment,
  CreateClientProgramDto,
  UpdateClientProgramDto,
} from "./client-program.types";

export default class ClientProgramApiClient extends BaseApi {
  private static instance: ClientProgramApiClient;

  private constructor() {
    super("/ClientPrograms");
  }

  public static getInstance(): ClientProgramApiClient {
    if (!ClientProgramApiClient.instance) {
      ClientProgramApiClient.instance = new ClientProgramApiClient();
    }
    return ClientProgramApiClient.instance;
  }

  public async getAll(): Promise<ClientProgramAssignment[]> {
    const res = await this.axiosInstance.get<
      ApiSuccessResponse<ClientProgramAssignment[]>
    >("/");
    return res.data.data;
  }

  /** Coach: returns ClientPrograms where the coach is assigned */
  public async getMyCoachPrograms(): Promise<ClientProgramAssignment[]> {
    const res = await this.axiosInstance.get<
      ApiSuccessResponse<ClientProgramAssignment[]>
    >("/my");
    return res.data.data;
  }

  /** Client: returns ClientPrograms assigned to the authenticated client */
  public async getMyClientPrograms(): Promise<ClientProgramAssignment[]> {
    const res = await this.axiosInstance.get<
      ApiSuccessResponse<ClientProgramAssignment[]>
    >("/for-me");
    return res.data.data;
  }

  public async getById(id: number): Promise<ClientProgramAssignment> {
    const res = await this.axiosInstance.get<
      ApiSuccessResponse<ClientProgramAssignment>
    >(`/${id}`);
    return res.data.data;
  }

  public async create(
    data: CreateClientProgramDto
  ): Promise<ClientProgramAssignment> {
    const res = await this.axiosInstance.post<
      ApiSuccessResponse<ClientProgramAssignment>
    >("/", data);
    return res.data.data;
  }

  public async update(
    id: number,
    data: UpdateClientProgramDto
  ): Promise<ClientProgramAssignment> {
    const res = await this.axiosInstance.patch<
      ApiSuccessResponse<ClientProgramAssignment>
    >(`/${id}`, data);
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
