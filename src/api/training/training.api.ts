import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  CreateTrainingDto,
  Training,
  UpdateTrainingDto,
} from "./training.types";

export default class TrainingApiClient extends BaseApi {
  private static instance: TrainingApiClient;

  private constructor() {
    super("/training");
  }

  public static getInstance() {
    if (!TrainingApiClient.instance) {
      TrainingApiClient.instance = new TrainingApiClient();
    }
    return TrainingApiClient.instance;
  }

  public async getByWeek(weekId: number): Promise<Training[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Training[]>>(
      `/?weekId=${weekId}`
    );
    return res.data.data;
  }

  public async getById(id: number): Promise<Training> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<Training>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async create(data: CreateTrainingDto): Promise<Training> {
    const res = await this.axiosInstance.post<ApiSuccessResponse<Training>>(
      "/",
      data
    );
    return res.data.data;
  }

  public async update(id: number, data: UpdateTrainingDto): Promise<Training> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<Training>>(
      `/${id}`,
      data
    );
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
