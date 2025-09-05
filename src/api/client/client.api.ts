import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  Client,
  ClientProgram,
  CreateClientDto,
  UpdateClientDto,
} from "./client.types";

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

  public async getById(id: string): Promise<Client> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Client>>(
      `/${id}`
    );
    return res.data.data;
  }
  public async getByUserId(id: string): Promise<Client> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Client>>(
      `/user/${id}`
    );
    return res.data.data;
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
