import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  CreateTrainingBlockDto,
  TrainingBlock,
  UpdateTrainingBlockDto,
} from "./training-block.types";

export default class TrainingBlockApiClient extends BaseApi {
  private static instance: TrainingBlockApiClient;

  private constructor() {
    super("/training-block");
  }

  public static getInstance() {
    if (!TrainingBlockApiClient.instance) {
      TrainingBlockApiClient.instance = new TrainingBlockApiClient();
    }
    return TrainingBlockApiClient.instance;
  }

  public async getByProgram(programId: number): Promise<TrainingBlock[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingBlock[]>>(
      `/?programId=${programId}`
    );
    return res.data.data;
  }

  public async getById(id: number): Promise<TrainingBlock> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingBlock>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async create(data: CreateTrainingBlockDto): Promise<TrainingBlock> {
    const res = await this.axiosInstance.post<ApiSuccessResponse<TrainingBlock>>(
      "/",
      data
    );
    return res.data.data;
  }

  public async update(id: number, data: UpdateTrainingBlockDto): Promise<TrainingBlock> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<TrainingBlock>>(
      `/${id}`,
      data
    );
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
