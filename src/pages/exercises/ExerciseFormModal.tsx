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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EXERCISE_MUSCLE_GROUP } from "@/api/exercises/exercises.enums";
import ExercisesApiClient from "@/api/exercises/exercises.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { IExerciseFormModalProps } from "./types";
import MultiSelectField from "@/components/shared/Form/MultiSelectField";

const schema = z.object({
	name: z.string().min(2, "Name is required"),
	description: z.string().optional(),
	tutorialUrl: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	primaryMuscles: z.array(z.string()),
	secondaryMuscles: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

export default function ExerciseFormModal({
	open,
	onClose,
	onSuccess,
	exercise,
}: IExerciseFormModalProps) {
	const exercisesApi = ExercisesApiClient.getInstance();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: "",
			description: "",
			tutorialUrl: "",
			primaryMuscles: [],
			secondaryMuscles: [],
		},
	});

	const watchedPrimaryMuscles = watch("primaryMuscles");
	const watchedSecondaryMuscles = watch("secondaryMuscles");

	useEffect(() => {
		if (open) {
			if (exercise) {
				reset({
					name: exercise.name,
					description: exercise.description ?? "",
					tutorialUrl: exercise.tutorialUrl ?? "",
					primaryMuscles: exercise.primaryMuscles ?? [],
					secondaryMuscles: exercise.secondaryMuscles ?? [],
				});
			} else {
				reset();
			}
		}
	}, [exercise, open, reset]);

	const handleArrayValueAdd = (
		fieldName: "primaryMuscles" | "secondaryMuscles",
		value: string
	): void => {
		const currentArray = watch(fieldName);
		if (value && !currentArray.includes(value)) {
			setValue(fieldName, [...currentArray, value], { shouldDirty: true });
		}
	};

	const handleArrayValueRemove = (
		fieldName: "primaryMuscles" | "secondaryMuscles",
		value: string
	): void => {
		const currentArray = watch(fieldName);
		setValue(
			fieldName,
			currentArray.filter((item) => item !== value),
			{ shouldDirty: true }
		);
	};

	const onSubmit = async (data: FormData): Promise<void> => {
		try {
			if (exercise) {
				await exercisesApi.update(exercise.id, data);
				showSuccess("Exercise updated");
			} else {
				await exercisesApi.create(data);
				showSuccess("Exercise created");
			}
			onSuccess();
			onClose();
		} catch {
			showError("Failed to save exercise");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
				<DialogHeader>
					<DialogTitle className="text-xl">
						{exercise ? "Edit Exercise" : "Create New Exercise"}
					</DialogTitle>
				</DialogHeader>

				<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
					{/* Essential Info */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground border-b pb-2">
							Basic Information
						</h3>

						<div>
							<Label>Exercise Name *</Label>
							<Input placeholder="e.g., Barbell Row" {...register("name")} />
							{errors.name && (
								<p className="text-sm text-red-500 mt-1">
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								placeholder="Short description..."
								{...register("description")}
							/>
						</div>

						<div>
							<Label>Tutorial URL</Label>
							<Input
								placeholder="https://youtube.com/watch?v=..."
								{...register("tutorialUrl")}
							/>
							{errors.tutorialUrl && (
								<p className="text-sm text-red-500 mt-1">
									{errors.tutorialUrl.message}
								</p>
							)}
						</div>
					</div>

					<Separator className="my-6" />

					{/* Muscles */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground border-b pb-2">
							Muscle Involvement
						</h3>

						<MultiSelectField
							label="Primary Muscles"
							options={Object.values(EXERCISE_MUSCLE_GROUP)}
							selectedValues={watchedPrimaryMuscles}
							onValueAdd={(value) =>
								handleArrayValueAdd("primaryMuscles", value)
							}
							onValueRemove={(value) =>
								handleArrayValueRemove("primaryMuscles", value)
							}
							description="Main muscles engaged"
						/>

						<MultiSelectField
							label="Secondary Muscles"
							options={Object.values(EXERCISE_MUSCLE_GROUP)}
							selectedValues={watchedSecondaryMuscles}
							onValueAdd={(value) =>
								handleArrayValueAdd("secondaryMuscles", value)
							}
							onValueRemove={(value) =>
								handleArrayValueRemove("secondaryMuscles", value)
							}
							description="Supporting or assisting muscles"
						/>
					</div>

					<Separator className="my-6" />

					{/* Submit */}
					<div className="flex justify-end space-x-3 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? "Saving..."
								: exercise
								? "Update Exercise"
								: "Create Exercise"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
