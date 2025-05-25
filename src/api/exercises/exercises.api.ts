// src/api/exercises/exercises.api.ts
import BaseApi from "@/lib/base.api";
import { ApiSuccessResponse } from "@/api/types";
import {
	Exercise,
	CreateExerciseDto,
	UpdateExerciseDto,
} from "./exercises.types";

export default class ExercisesApiClient extends BaseApi {
	private static instance: ExercisesApiClient;

	private constructor() {
		super("/exercises");
	}

	public static getInstance() {
		if (!ExercisesApiClient.instance) {
			ExercisesApiClient.instance = new ExercisesApiClient();
		}
		return ExercisesApiClient.instance;
	}

	public async getAll(): Promise<Exercise[]> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<Exercise[]>>(
			"/"
		);
		return res.data.data;
	}

	public async getById(id: number): Promise<Exercise> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<Exercise>>(
			`/${id}`
		);
		return res.data.data;
	}

	public async getCoachExercises(onlyMine: boolean): Promise<Exercise[]> {
		const res = await this.axiosInstance.get<ApiSuccessResponse<Exercise[]>>(
			`/my?onlyMine=${onlyMine}`
		);
		return res.data.data;
	}

	public async create(data: CreateExerciseDto): Promise<Exercise> {
		const res = await this.axiosInstance.post<ApiSuccessResponse<Exercise>>(
			"/",
			data
		);
		return res.data.data;
	}

	public async update(id: number, data: UpdateExerciseDto): Promise<Exercise> {
		const res = await this.axiosInstance.patch<ApiSuccessResponse<Exercise>>(
			`/${id}`,
			data
		);
		return res.data.data;
	}

	public async delete(id: number): Promise<void> {
		await this.axiosInstance.delete(`/${id}`);
	}
}
