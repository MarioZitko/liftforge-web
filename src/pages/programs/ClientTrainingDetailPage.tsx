import TrainingApiClient from "@/api/training/training.api";
import { Training } from "@/api/training/training.types";
import TrainingExerciseApiClient from "@/api/training-exercise/training-exercise.api";
import { TrainingExercise } from "@/api/training-exercise/training-exercise.types";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

// ── Schema ────────────────────────────────────────────────────────────────────

const logSchema = z.object({
	weight: z.coerce.number().min(0, "Weight must be 0 or more"),
	rpeActual: z.coerce
		.number()
		.min(0)
		.max(10)
		.optional()
		.or(z.literal("")),
	note: z.string().optional(),
	videoUrl: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasLog(te: TrainingExercise) {
	return (
		te.rpeActual != null ||
		(te.note && te.note.trim() !== "") ||
		(te.videoUrl && te.videoUrl.trim() !== "")
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientTrainingDetailPage() {
	const { programId, trainingId } = useParams<{
		programId: string;
		trainingId: string;
	}>();
	const navigate = useNavigate();

	const [training, setTraining] = useState<Training | null>(null);
	const [exercises, setExercises] = useState<TrainingExercise[]>([]);
	const [loading, setLoading] = useState(true);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [loggingTe, setLoggingTe] = useState<TrainingExercise | null>(null);

	const form = useForm<LogFormValues>({
		resolver: zodResolver(logSchema),
		defaultValues: { weight: 0, rpeActual: "", note: "", videoUrl: "" },
	});

	useEffect(() => {
		if (trainingId) fetchAll(+trainingId);
	}, [trainingId]);

	async function fetchAll(tid: number) {
		setLoading(true);
		try {
			const [t, exs] = await Promise.all([
				TrainingApiClient.getInstance().getById(tid),
				TrainingExerciseApiClient.getInstance().getByTraining(tid),
			]);
			setTraining(t);
			setExercises(exs);
		} catch (err) {
			showError(err, "Failed to load session.");
		} finally {
			setLoading(false);
		}
	}

	function openLog(te: TrainingExercise) {
		setLoggingTe(te);
		form.reset({
			weight: te.weight,
			rpeActual: te.rpeActual ?? "",
			note: te.note ?? "",
			videoUrl: te.videoUrl ?? "",
		});
		setDialogOpen(true);
	}

	async function handleSaveLog(values: LogFormValues) {
		if (!loggingTe) return;
		try {
			await TrainingExerciseApiClient.getInstance().update(loggingTe.id, {
				weight: values.weight,
				rpeActual:
					values.rpeActual === "" ? undefined : Number(values.rpeActual),
				note: values.note,
				videoUrl: values.videoUrl,
			});
			showSuccess("Saved.");
			setDialogOpen(false);
			fetchAll(+trainingId!);
		} catch (err) {
			showError(err, "Failed to save.");
		}
	}

	// ── Render ────────────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="px-4 py-6 max-w-screen-xl mx-auto">
				<p className="text-muted-foreground">Loading…</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(`/my-programs/${programId}`)}
				>
					← Program
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{training?.name ?? "Session"}</h1>
					{training?.date && (
						<p className="text-sm text-muted-foreground">
							{new Date(training.date).toLocaleDateString(undefined, {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					)}
				</div>
			</div>

			{/* Exercise list */}
			<Card>
				<CardHeader>
					<CardTitle>Exercises</CardTitle>
					<CardDescription>
						Tap <Pencil className="inline w-3 h-3" /> to log your actual weight,
						RPE, notes, or a video link.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{exercises.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							No exercises in this session yet.
						</p>
					)}

					{exercises.map((te, idx) => (
						<div
							key={te.id}
							className="flex items-start gap-4 rounded-lg border bg-card px-4 py-3"
						>
							{/* Order number */}
							<span className="text-muted-foreground text-sm font-mono mt-0.5 w-5 shrink-0">
								{idx + 1}.
							</span>

							{/* Info */}
							<div className="flex-1 min-w-0 space-y-1">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="font-medium text-sm">
										{te.exercise?.name ?? `Exercise #${te.exerciseId}`}
									</span>
									{hasLog(te) && (
										<CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
									)}
								</div>

								{/* Planned values row */}
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="text-xs">
										{te.sets} × {te.reps} @ {te.weight} kg
									</Badge>
									{te.rpePlanned != null && (
										<Badge variant="outline" className="text-xs">
											Planned RPE {te.rpePlanned}
										</Badge>
									)}
								</div>

								{/* Logged values row */}
								{(te.rpeActual != null ||
									(te.note && te.note.trim()) ||
									(te.videoUrl && te.videoUrl.trim())) && (
									<div className="flex flex-wrap gap-2 mt-1">
										{te.rpeActual != null && (
											<Badge className="text-xs bg-green-600 hover:bg-green-600">
												Actual RPE {te.rpeActual}
											</Badge>
										)}
										{te.note && te.note.trim() && (
											<span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
												{te.note}
											</span>
										)}
										{te.videoUrl && te.videoUrl.trim() && (
											<a
												href={te.videoUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-blue-500 underline truncate max-w-[160px]"
												onClick={(e) => e.stopPropagation()}
											>
												Video
											</a>
										)}
									</div>
								)}
							</div>

							{/* Log button */}
							<Button
								size="sm"
								variant="outline"
								className="shrink-0"
								onClick={() => openLog(te)}
							>
								<Pencil className="w-3 h-3 mr-1" />
								Log
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			{/* ── Log Dialog ────────────────────────────────────────────────────── */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle>
							Log — {loggingTe?.exercise?.name ?? `Exercise #${loggingTe?.exerciseId}`}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={form.handleSubmit(handleSaveLog)}
						className="space-y-4 py-2"
					>
						{/* Planned summary */}
						{loggingTe && (
							<div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
								Planned: {loggingTe.sets} sets × {loggingTe.reps} reps
								{loggingTe.rpePlanned != null
									? ` @ RPE ${loggingTe.rpePlanned}`
									: ""}
							</div>
						)}

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label>Weight used (kg)</Label>
								<Input
									type="number"
									min={0}
									step={0.5}
									{...form.register("weight")}
								/>
								{form.formState.errors.weight && (
									<p className="text-xs text-red-500">
										{form.formState.errors.weight.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label>Actual RPE (0–10)</Label>
								<Input
									type="number"
									min={0}
									max={10}
									step={0.5}
									placeholder="—"
									{...form.register("rpeActual")}
								/>
								{form.formState.errors.rpeActual && (
									<p className="text-xs text-red-500">
										{form.formState.errors.rpeActual.message}
									</p>
								)}
							</div>
						</div>

						<div className="space-y-1">
							<Label>Note</Label>
							<Textarea
								placeholder="How did it feel? Any coaching cues to remember…"
								rows={2}
								{...form.register("note")}
							/>
						</div>

						<div className="space-y-1">
							<Label>Video URL</Label>
							<Input
								placeholder="https://…"
								{...form.register("videoUrl")}
							/>
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								type="button"
								onClick={() => setDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? "Saving…" : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
