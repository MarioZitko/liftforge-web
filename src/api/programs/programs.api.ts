// src/api/Program/Program.api.ts
import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import { CreateProgramDto, Program, UpdateProgramDto } from "./programs.types";

export default class ProgramApiClient extends BaseApi {
  private static instance: ProgramApiClient;

  private constructor() {
    super("/programs");
  }

  public static getInstance() {
    if (!ProgramApiClient.instance) {
      ProgramApiClient.instance = new ProgramApiClient();
    }
    return ProgramApiClient.instance;
  }

  public async getAll(): Promise<Program[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Program[]>>(
      "/"
    );
    return res.data.data;
  }

  public async getById(id: number): Promise<Program> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Program>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async getCoachProgram(onlyMine: boolean): Promise<Program[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Program[]>>(
      `/my?onlyMine=${onlyMine}`
    );
    return res.data.data;
  }

  public async create(data: CreateProgramDto): Promise<Program> {
    const res = await this.axiosInstance.post<ApiSuccessResponse<Program>>(
      "/",
      data
    );
    return res.data.data;
  }

  public async update(id: number, data: UpdateProgramDto): Promise<Program> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<Program>>(
      `/${id}`,
      data
    );
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
