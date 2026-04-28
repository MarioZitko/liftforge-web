import ExercisesApiClient from "@/api/exercises/exercises.api";
import { Exercise } from "@/api/exercises/exercises.types";
import TrainingApiClient from "@/api/training/training.api";
import { Training } from "@/api/training/training.types";
import TrainingExerciseApiClient from "@/api/training-exercise/training-exercise.api";
import { TrainingExercise } from "@/api/training-exercise/training-exercise.types";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	closestCenter,
	DndContext,
	DragEndEvent,
	MouseSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

// ── Schema ────────────────────────────────────────────────────────────────────

const exerciseSchema = z.object({
	exerciseId: z.coerce.number().int().min(1, "Exercise is required"),
	sets: z.coerce.number().int().min(1, "Sets required"),
	reps: z.coerce.number().int().min(1, "Reps required"),
	weight: z.coerce.number().min(0, "Weight required"),
	rpePlanned: z.coerce.number().min(0).max(10).optional().or(z.literal("")),
	rpeActual: z.coerce.number().min(0).max(10).optional().or(z.literal("")),
	note: z.string().optional(),
	videoUrl: z.string().optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

// ── Sortable row ──────────────────────────────────────────────────────────────

interface SortableExerciseRowProps {
	te: TrainingExercise;
	onEdit: (te: TrainingExercise) => void;
	onDelete: (te: TrainingExercise) => void;
}

function SortableExerciseRow({ te, onEdit, onDelete }: SortableExerciseRowProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: te.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-start gap-3 rounded-lg border bg-card px-4 py-3"
		>
			{/* Drag handle */}
			<button
				{...attributes}
				{...listeners}
				className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
				type="button"
			>
				<GripVertical className="w-4 h-4" />
			</button>

			{/* Exercise info */}
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm truncate">
					{te.exercise?.name ?? `Exercise #${te.exerciseId}`}
				</p>
				<div className="flex flex-wrap gap-2 mt-1">
					<Badge variant="secondary" className="text-xs">
						{te.sets} × {te.reps} @ {te.weight} kg
					</Badge>
					{te.rpePlanned != null && (
						<Badge variant="outline" className="text-xs">
							RPE {te.rpePlanned}
						</Badge>
					)}
					{te.rpeActual != null && (
						<Badge variant="outline" className="text-xs">
							Actual RPE {te.rpeActual}
						</Badge>
					)}
					{te.volume && (
						<Badge variant="outline" className="text-xs text-muted-foreground">
							Vol: {te.volume.volumeTotal.toFixed(0)} kg
						</Badge>
					)}
				</div>
				{te.note && (
					<p className="text-xs text-muted-foreground mt-1 truncate">{te.note}</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-2 shrink-0">
				<Button size="sm" variant="outline" onClick={() => onEdit(te)}>
					Edit
				</Button>
				<Button
					size="sm"
					variant="destructive"
					onClick={() => onDelete(te)}
				>
					Delete
				</Button>
			</div>
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrainingDetailPage() {
	const { programId, trainingId } = useParams<{
		programId: string;
		trainingId: string;
	}>();
	const navigate = useNavigate();

	const [training, setTraining] = useState<Training | null>(null);
	const [exercises, setExercises] = useState<TrainingExercise[]>([]);
	const [library, setLibrary] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(true);
	const [exerciseSearch, setExerciseSearch] = useState("");

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTe, setEditingTe] = useState<TrainingExercise | null>(null);
	const [deletingTe, setDeletingTe] = useState<TrainingExercise | null>(null);

	const form = useForm<ExerciseFormValues>({
		resolver: zodResolver(exerciseSchema),
		defaultValues: {
			exerciseId: 0,
			sets: 3,
			reps: 8,
			weight: 0,
			rpePlanned: "",
			rpeActual: "",
			note: "",
			videoUrl: "",
		},
	});

	const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } });
	const sensors = useSensors(mouseSensor);

	useEffect(() => {
		if (trainingId) fetchAll(+trainingId);
	}, [trainingId]);

	async function fetchAll(tid: number) {
		setLoading(true);
		try {
			const [t, exs, lib] = await Promise.all([
				TrainingApiClient.getInstance().getById(tid),
				TrainingExerciseApiClient.getInstance().getByTraining(tid),
				ExercisesApiClient.getInstance().getAll(),
			]);
			setTraining(t);
			setExercises(exs);
			setLibrary(lib);
		} catch (err) {
			showError(err, "Failed to load session.");
		} finally {
			setLoading(false);
		}
	}

	// ── Dialog helpers ────────────────────────────────────────────────────────

	function openCreate() {
		setEditingTe(null);
		setExerciseSearch("");
		form.reset({
			exerciseId: 0,
			sets: 3,
			reps: 8,
			weight: 0,
			rpePlanned: "",
			rpeActual: "",
			note: "",
			videoUrl: "",
		});
		setDialogOpen(true);
	}

	function openEdit(te: TrainingExercise) {
		setEditingTe(te);
		setExerciseSearch("");
		form.reset({
			exerciseId: te.exerciseId,
			sets: te.sets,
			reps: te.reps,
			weight: te.weight,
			rpePlanned: te.rpePlanned ?? "",
			rpeActual: te.rpeActual ?? "",
			note: te.note ?? "",
			videoUrl: te.videoUrl ?? "",
		});
		setDialogOpen(true);
	}

	async function handleSave(values: ExerciseFormValues) {
		try {
			if (editingTe) {
				await TrainingExerciseApiClient.getInstance().update(editingTe.id, {
					sets: values.sets,
					reps: values.reps,
					weight: values.weight,
					rpePlanned: values.rpePlanned === "" ? undefined : Number(values.rpePlanned),
					rpeActual: values.rpeActual === "" ? undefined : Number(values.rpeActual),
					note: values.note,
					videoUrl: values.videoUrl,
				});
				showSuccess("Exercise updated.");
			} else {
				await TrainingExerciseApiClient.getInstance().create({
					trainingId: +trainingId!,
					exerciseId: Number(values.exerciseId),
					sortOrder: exercises.length,
					sets: values.sets,
					reps: values.reps,
					weight: values.weight,
					rpePlanned: values.rpePlanned === "" ? undefined : Number(values.rpePlanned),
					rpeActual: values.rpeActual === "" ? undefined : Number(values.rpeActual),
					note: values.note,
					videoUrl: values.videoUrl,
				});
				showSuccess("Exercise added.");
			}
			setDialogOpen(false);
			fetchAll(+trainingId!);
		} catch (err) {
			showError(err, "Failed to save exercise.");
		}
	}

	async function confirmDelete() {
		if (!deletingTe) return;
		try {
			await TrainingExerciseApiClient.getInstance().delete(deletingTe.id);
			showSuccess("Exercise removed.");
			fetchAll(+trainingId!);
		} catch (err) {
			showError(err, "Failed to delete exercise.");
		} finally {
			setDeletingTe(null);
		}
	}

	// ── Drag-and-drop ─────────────────────────────────────────────────────────

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = exercises.findIndex((e) => e.id === active.id);
		const newIndex = exercises.findIndex((e) => e.id === over.id);
		const reordered = arrayMove(exercises, oldIndex, newIndex);
		setExercises(reordered);

		try {
			await TrainingExerciseApiClient.getInstance().reorder(
				+trainingId!,
				reordered.map((e) => e.id)
			);
		} catch (err) {
			showError(err, "Failed to save order.");
			fetchAll(+trainingId!);
		}
	}

	// ── Filtered library for select ───────────────────────────────────────────

	const filteredLibrary = library.filter((ex) =>
		ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
	);

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
					onClick={() => navigate(`/programs/${programId}`)}
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
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Exercises</CardTitle>
							<CardDescription>Drag to reorder</CardDescription>
						</div>
						<Button size="sm" onClick={openCreate}>
							<Plus className="w-4 h-4 mr-1" />
							Add Exercise
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					{exercises.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							No exercises yet. Add one to get started.
						</p>
					)}

					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={exercises.map((e) => e.id)}
							strategy={verticalListSortingStrategy}
						>
							{exercises.map((te) => (
								<SortableExerciseRow
									key={te.id}
									te={te}
									onEdit={openEdit}
									onDelete={setDeletingTe}
								/>
							))}
						</SortableContext>
					</DndContext>
				</CardContent>
			</Card>

			{/* ── Add / Edit Exercise Dialog ─────────────────────────────────── */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-[520px]">
					<DialogHeader>
						<DialogTitle>
							{editingTe ? "Edit Exercise" : "Add Exercise"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={form.handleSubmit(handleSave)}
						className="space-y-4 py-2"
					>
						{/* Exercise picker — only shown on create */}
						{!editingTe && (
							<div className="space-y-1">
								<Label>Exercise</Label>
								<Input
									placeholder="Search exercise library…"
									value={exerciseSearch}
									onChange={(e) => setExerciseSearch(e.target.value)}
									className="mb-1"
								/>
								<Controller
									control={form.control}
									name="exerciseId"
									render={({ field }) => (
										<Select
											value={field.value ? String(field.value) : ""}
											onValueChange={(v) => field.onChange(Number(v))}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select exercise…" />
											</SelectTrigger>
											<SelectContent>
												{filteredLibrary.map((ex) => (
													<SelectItem key={ex.id} value={String(ex.id)}>
														{ex.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{form.formState.errors.exerciseId && (
									<p className="text-sm text-red-500">
										{form.formState.errors.exerciseId.message}
									</p>
								)}
							</div>
						)}

						{/* Sets / Reps / Weight */}
						<div className="grid grid-cols-3 gap-3">
							<div className="space-y-1">
								<Label>Sets</Label>
								<Input type="number" min={1} {...form.register("sets")} />
								{form.formState.errors.sets && (
									<p className="text-xs text-red-500">
										{form.formState.errors.sets.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label>Reps</Label>
								<Input type="number" min={1} {...form.register("reps")} />
								{form.formState.errors.reps && (
									<p className="text-xs text-red-500">
										{form.formState.errors.reps.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label>Weight (kg)</Label>
								<Input type="number" min={0} step={0.5} {...form.register("weight")} />
								{form.formState.errors.weight && (
									<p className="text-xs text-red-500">
										{form.formState.errors.weight.message}
									</p>
								)}
							</div>
						</div>

						{/* RPE */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label>RPE Planned (0–10)</Label>
								<Input
									type="number"
									min={0}
									max={10}
									step={0.5}
									placeholder="—"
									{...form.register("rpePlanned")}
								/>
							</div>
							<div className="space-y-1">
								<Label>RPE Actual (0–10)</Label>
								<Input
									type="number"
									min={0}
									max={10}
									step={0.5}
									placeholder="—"
									{...form.register("rpeActual")}
								/>
							</div>
						</div>

						{/* Note */}
						<div className="space-y-1">
							<Label>Note</Label>
							<Textarea
								placeholder="Coaching cues, tempo, etc."
								rows={2}
								{...form.register("note")}
							/>
						</div>

						{/* Video URL */}
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
								{form.formState.isSubmitting
									? "Saving…"
									: editingTe
									? "Save"
									: "Add"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Delete Confirmation ────────────────────────────────────────── */}
			<AlertDialog
				open={!!deletingTe}
				onOpenChange={(o) => !o && setDeletingTe(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove exercise?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove{" "}
							<strong>
								{deletingTe?.exercise?.name ?? `Exercise #${deletingTe?.exerciseId}`}
							</strong>{" "}
							from this session.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete}>Remove</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
