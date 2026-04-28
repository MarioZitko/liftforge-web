import { ApiSuccessResponse } from "@/api/types";
import BaseApi from "@/lib/base.api";
import {
  CreateTrainingExerciseDto,
  TrainingExercise,
  UpdateTrainingExerciseDto,
} from "./training-exercise.types";

export default class TrainingExerciseApiClient extends BaseApi {
  private static instance: TrainingExerciseApiClient;

  private constructor() {
    super("/training-exercise");
  }

  public static getInstance() {
    if (!TrainingExerciseApiClient.instance) {
      TrainingExerciseApiClient.instance = new TrainingExerciseApiClient();
    }
    return TrainingExerciseApiClient.instance;
  }

  public async getByTraining(trainingId: number): Promise<TrainingExercise[]> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingExercise[]>>(
      `/?trainingId=${trainingId}`
    );
    return res.data.data;
  }

  public async getById(id: number): Promise<TrainingExercise> {
    const res = await this.axiosInstance.get<ApiSuccessResponse<TrainingExercise>>(
      `/${id}`
    );
    return res.data.data;
  }

  public async create(data: CreateTrainingExerciseDto): Promise<TrainingExercise> {
    const res = await this.axiosInstance.post<ApiSuccessResponse<TrainingExercise>>(
      "/",
      data
    );
    return res.data.data;
  }

  public async update(id: number, data: UpdateTrainingExerciseDto): Promise<TrainingExercise> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<TrainingExercise>>(
      `/${id}`,
      data
    );
    return res.data.data;
  }

  public async reorder(trainingId: number, orderedIds: number[]): Promise<TrainingExercise[]> {
    const res = await this.axiosInstance.patch<ApiSuccessResponse<TrainingExercise[]>>(
      `/reorder`,
      { trainingId, orderedIds }
    );
    return res.data.data;
  }

  public async delete(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }
}
