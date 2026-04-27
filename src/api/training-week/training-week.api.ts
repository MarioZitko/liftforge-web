import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  CreateTrainingWeekDto,
  TrainingWeek,
  UpdateTrainingWeekDto,
} from "./training-week.types";

export default class TrainingWeekApiClient extends BaseApi {
  private static instance: TrainingWeekApiClient;

  private constructor() {
    super("/training-week");
  }

  public static getInstance() {
    if (!TrainingWeekApiClient.instance) {
      TrainingWeekApiClient.instance = new TrainingWeekApiClient();
    }
    return TrainingWeekApiClient.instance;
  }

  public async getByBlock(blockId: number): Promise<TrainingWeek[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingWeek[]>>(
      `/?blockId=${blockId}`
    );
    return res.data.data;
  }

  public async getById(id: number): Promise<TrainingWeek> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingWeek>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async create(data: CreateTrainingWeekDto): Promise<TrainingWeek> {
    const res = await this.axiosInstance.post<ApiSuccessResponse<TrainingWeek>>(
      "/",
      data
    );
    return res.data.data;
  }

  public async update(id: number, data: UpdateTrainingWeekDto): Promise<TrainingWeek> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<TrainingWeek>>(
      `/${id}`,
      data
    );
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
