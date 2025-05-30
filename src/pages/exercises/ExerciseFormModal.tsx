import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Exercise,
	CreateExerciseDto,
	UpdateExerciseDto,
} from "@/api/exercises/exercises.types";
import ExercisesApiClient from "@/api/exercises/exercises.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";

interface Props {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	exercise: Exercise | null; // if null, creating a new one
}

const schema = z.object({
	name: z.string().min(2, "Name is required"),
	description: z.string().optional(),
	tutorialUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ExerciseFormModal({
	open,
	onClose,
	onSuccess,
	exercise,
}: Props) {
	const exercisesApi = ExercisesApiClient.getInstance();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			description: "",
			tutorialUrl: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			if (exercise) {
				const updateDto: UpdateExerciseDto = data;
				await exercisesApi.update(exercise.id, updateDto);
				showSuccess("Exercise updated");
			} else {
				const createDto: CreateExerciseDto = data;
				await exercisesApi.create(createDto);
				showSuccess("Exercise created");
			}
			onSuccess();
			reset();
		} catch {
			showError("Failed to save exercise");
		}
	};

	// Load existing values if editing
	useEffect(() => {
		if (exercise) {
			reset({
				name: exercise.name,
				description: exercise.description ?? "",
				tutorialUrl: exercise.tutorialUrl ?? "",
			});
		} else {
			reset();
		}
	}, [exercise, reset]);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{exercise ? "Edit Exercise" : "Create Exercise"}
					</DialogTitle>
				</DialogHeader>

				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<Input placeholder="Exercise name" {...register("name")} />
						{errors.name && (
							<p className="text-sm text-red-500">{errors.name.message}</p>
						)}
					</div>

					<div>
						<Textarea
							placeholder="Description (optional)"
							{...register("description")}
						/>
						{errors.description && (
							<p className="text-sm text-red-500">
								{errors.description.message}
							</p>
						)}
					</div>

					<div>
						<Input
							placeholder="Tutorial URL (optional)"
							{...register("tutorialUrl")}
						/>
						{errors.tutorialUrl && (
							<p className="text-sm text-red-500">
								{errors.tutorialUrl.message}
							</p>
						)}
					</div>

					<div className="flex justify-end">
						<Button type="submit" disabled={isSubmitting}>
							{exercise ? "Update" : "Create"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
