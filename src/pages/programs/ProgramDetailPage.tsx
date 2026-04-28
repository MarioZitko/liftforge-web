import TrainingBlockApiClient from "@/api/training-block/training-block.api";
import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import TrainingApiClient from "@/api/training/training.api";
import { Training } from "@/api/training/training.types";
import TrainingWeekApiClient from "@/api/training-week/training-week.api";
import ProgramsApiClient from "@/api/programs/programs.api";
import { Program } from "@/api/programs/programs.types";
import { ProgramGrid } from "./components/ProgramGrid";
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
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Dumbbell, LayoutGrid, List, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

// ── Schemas ──────────────────────────────────────────────────────────────────

const blockSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

const weekSchema = z.object({
	name: z.string().min(1, "Name is required"),
	number: z.coerce.number().int().min(1, "Week number must be at least 1"),
});

const trainingSchema = z.object({
	name: z.string().min(1, "Name is required"),
	date: z.string().min(1, "Date is required"),
});

type BlockFormValues = z.infer<typeof blockSchema>;
type WeekFormValues = z.infer<typeof weekSchema>;
type TrainingFormValues = z.infer<typeof trainingSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayIso() {
	return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
	const { programId } = useParams<{ programId: string }>();
	const navigate = useNavigate();

	const [program, setProgram] = useState<Program | null>(null);
	const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
	const [loading, setLoading] = useState(true);
	const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());
	const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
	const [openTrainings, setOpenTrainings] = useState<Set<number>>(new Set());

	const [view, setView] = useState<"list" | "grid">("list");

	// Block dialog
	const [blockDialogOpen, setBlockDialogOpen] = useState(false);
	const [editingBlock, setEditingBlock] = useState<TrainingBlock | null>(null);
	const [deleteBlockTarget, setDeleteBlockTarget] = useState<TrainingBlock | null>(null);

	// Week dialog (carries parent blockId)
	const [weekDialogOpen, setWeekDialogOpen] = useState(false);
	const [weekBlockId, setWeekBlockId] = useState<number | null>(null);
	const [editingWeek, setEditingWeek] = useState<TrainingWeekSummary | null>(null);
	const [deleteWeekTarget, setDeleteWeekTarget] = useState<{ week: TrainingWeekSummary; blockId: number } | null>(null);

	// Training dialog (carries parent weekId)
	const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
	const [trainingWeekId, setTrainingWeekId] = useState<number | null>(null);
	const [editingTraining, setEditingTraining] = useState<Training | null>(null);
	const [deleteTrainingTarget, setDeleteTrainingTarget] = useState<Training | null>(null);

	const blockForm = useForm<BlockFormValues>({
		resolver: zodResolver(blockSchema),
		defaultValues: { name: "", description: "" },
	});

	const weekForm = useForm<WeekFormValues>({
		resolver: zodResolver(weekSchema),
		defaultValues: { name: "", number: 1 },
	});

	const trainingForm = useForm<TrainingFormValues>({
		resolver: zodResolver(trainingSchema),
		defaultValues: { name: "", date: todayIso() },
	});

	useEffect(() => {
		if (programId) fetchAll(+programId);
	}, [programId]);

	async function fetchAll(pid: number) {
		setLoading(true);
		try {
			const [prog, blks] = await Promise.all([
				ProgramsApiClient.getInstance().getById(pid),
				TrainingBlockApiClient.getInstance().getByProgram(pid),
			]);
			setProgram(prog);
			setBlocks(blks);
		} catch (err) {
			showError(err, "Failed to load program.");
		} finally {
			setLoading(false);
		}
	}

	// ── Block handlers ────────────────────────────────────────────────────────

	function openCreateBlock() {
		setEditingBlock(null);
		blockForm.reset({ name: "", description: "" });
		setBlockDialogOpen(true);
	}

	function openEditBlock(block: TrainingBlock) {
		setEditingBlock(block);
		blockForm.reset({ name: block.name, description: block.description ?? "" });
		setBlockDialogOpen(true);
	}

	async function handleSaveBlock(values: BlockFormValues) {
		try {
			if (editingBlock) {
				await TrainingBlockApiClient.getInstance().update(editingBlock.id, values);
				showSuccess("Block updated.");
			} else {
				const created = await TrainingBlockApiClient.getInstance().create({
					...values,
					programId: +programId!,
				});
				setOpenBlocks((s) => new Set(s).add(created.id));
				showSuccess("Block created.");
			}
			setBlockDialogOpen(false);
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to save block.");
		}
	}

	async function confirmDeleteBlock() {
		if (!deleteBlockTarget) return;
		try {
			await TrainingBlockApiClient.getInstance().delete(deleteBlockTarget.id);
			showSuccess("Block deleted.");
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to delete block.");
		} finally {
			setDeleteBlockTarget(null);
		}
	}

	// ── Week handlers ─────────────────────────────────────────────────────────

	function openCreateWeek(blockId: number) {
		const block = blocks.find((b) => b.id === blockId);
		const nextNumber = (block?.weeks.length ?? 0) + 1;
		setEditingWeek(null);
		setWeekBlockId(blockId);
		weekForm.reset({ name: `Week ${nextNumber}`, number: nextNumber });
		setWeekDialogOpen(true);
	}

	function openEditWeek(week: TrainingWeekSummary, blockId: number) {
		setEditingWeek(week);
		setWeekBlockId(blockId);
		weekForm.reset({ name: week.name, number: week.number });
		setWeekDialogOpen(true);
	}

	async function handleSaveWeek(values: WeekFormValues) {
		try {
			if (editingWeek) {
				await TrainingWeekApiClient.getInstance().update(editingWeek.id, values);
				showSuccess("Week updated.");
			} else {
				const created = await TrainingWeekApiClient.getInstance().create({
					...values,
					blockId: weekBlockId!,
				});
				setOpenWeeks((s) => new Set(s).add(created.id));
				showSuccess("Week created.");
			}
			setWeekDialogOpen(false);
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to save week.");
		}
	}

	async function confirmDeleteWeek() {
		if (!deleteWeekTarget) return;
		try {
			await TrainingWeekApiClient.getInstance().delete(deleteWeekTarget.week.id);
			showSuccess("Week deleted.");
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to delete week.");
		} finally {
			setDeleteWeekTarget(null);
		}
	}

	// ── Training handlers ─────────────────────────────────────────────────────

	function openCreateTraining(weekId: number) {
		setEditingTraining(null);
		setTrainingWeekId(weekId);
		trainingForm.reset({ name: "", date: todayIso() });
		setTrainingDialogOpen(true);
	}

	function openEditTraining(training: Training) {
		setEditingTraining(training);
		setTrainingWeekId(training.weekId);
		trainingForm.reset({
			name: training.name,
			date: training.date.split("T")[0],
		});
		setTrainingDialogOpen(true);
	}

	async function handleSaveTraining(values: TrainingFormValues) {
		try {
			if (editingTraining) {
				await TrainingApiClient.getInstance().update(editingTraining.id, {
					name: values.name,
					date: new Date(values.date + "T00:00:00.000Z").toISOString(),
				});
				showSuccess("Session updated.");
			} else {
				await TrainingApiClient.getInstance().create({
					name: values.name,
					date: new Date(values.date + "T00:00:00.000Z").toISOString(),
					weekId: trainingWeekId!,
				});
				showSuccess("Session created.");
			}
			setTrainingDialogOpen(false);
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to save session.");
		}
	}

	async function confirmDeleteTraining() {
		if (!deleteTrainingTarget) return;
		try {
			await TrainingApiClient.getInstance().delete(deleteTrainingTarget.id);
			showSuccess("Session deleted.");
			fetchAll(+programId!);
		} catch (err) {
			showError(err, "Failed to delete session.");
		} finally {
			setDeleteTrainingTarget(null);
		}
	}

	// ── Collapse helpers ──────────────────────────────────────────────────────

	function toggleBlock(id: number) {
		setOpenBlocks((s) => {
			const next = new Set(s);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}

	function toggleWeek(id: number) {
		setOpenWeeks((s) => {
			const next = new Set(s);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}

	function toggleTraining(id: number) {
		setOpenTrainings((s) => {
			const next = new Set(s);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
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
				<Button variant="ghost" size="sm" onClick={() => navigate("/programs")}>
					← Programs
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{program?.name ?? "Program"}</h1>
					{program?.description && (
						<p className="text-sm text-muted-foreground">{program.description}</p>
					)}
				</div>
			</div>

			{/* Blocks toolbar */}
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-lg font-semibold">Training Blocks</h2>
				<div className="flex items-center gap-2">
					{/* View toggle */}
					<div className="flex items-center border rounded-md overflow-hidden">
						<button
							className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
								view === "list"
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted text-muted-foreground"
							}`}
							onClick={() => setView("list")}
						>
							<List className="w-3.5 h-3.5" />
							List
						</button>
						<button
							className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
								view === "grid"
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted text-muted-foreground"
							}`}
							onClick={() => setView("grid")}
						>
							<LayoutGrid className="w-3.5 h-3.5" />
							Grid
						</button>
					</div>
					<Button size="sm" onClick={openCreateBlock}>
						<Plus className="w-4 h-4 mr-1" />
						Add Block
					</Button>
				</div>
			</div>

			{/* Grid view */}
			{view === "grid" && (
				<ProgramGrid
					blocks={blocks}
					variant="coach"
					onSessionClick={(t) =>
						navigate(`/programs/${programId}/trainings/${t.id}`)
					}
				/>
			)}

			{/* List view */}
			{view === "list" && (
			<div className="space-y-4">
				{blocks.length === 0 && (
					<p className="text-muted-foreground text-sm">
						No blocks yet. Add a training block to get started.
					</p>
				)}

				{blocks.map((block) => (
					<Card key={block.id}>
						<Collapsible
							open={openBlocks.has(block.id)}
							onOpenChange={() => toggleBlock(block.id)}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CollapsibleTrigger asChild>
										<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">
											{openBlocks.has(block.id) ? (
												<ChevronDown className="w-4 h-4 shrink-0" />
											) : (
												<ChevronRight className="w-4 h-4 shrink-0" />
											)}
											<div>
												<CardTitle className="text-base">{block.name}</CardTitle>
												{block.description && (
													<p className="text-sm text-muted-foreground mt-0.5">
														{block.description}
													</p>
												)}
											</div>
										</button>
									</CollapsibleTrigger>
									<div className="flex gap-2 shrink-0 ml-4">
										<Badge variant="outline" className="text-xs">
											{block.weeks.length} week{block.weeks.length !== 1 ? "s" : ""}
										</Badge>
										<Button
											size="sm"
											variant="outline"
											onClick={() => openEditBlock(block)}
										>
											Edit
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => openCreateWeek(block.id)}
										>
											<Plus className="w-3 h-3 mr-1" />
											Week
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => setDeleteBlockTarget(block)}
										>
											Delete
										</Button>
									</div>
								</div>
							</CardHeader>

							<CollapsibleContent>
								<CardContent className="pt-0 space-y-3">
									{block.weeks.length === 0 && (
										<p className="text-sm text-muted-foreground pl-6">
											No weeks yet.
										</p>
									)}

									{block.weeks.map((week) => (
										<div key={week.id} className="border rounded-md">
											<Collapsible
												open={openWeeks.has(week.id)}
												onOpenChange={() => toggleWeek(week.id)}
											>
												<div className="flex items-center justify-between px-4 py-2">
													<CollapsibleTrigger asChild>
														<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">
															{openWeeks.has(week.id) ? (
																<ChevronDown className="w-3 h-3 shrink-0" />
															) : (
																<ChevronRight className="w-3 h-3 shrink-0" />
															)}
															<span className="font-medium text-sm">
																{week.name}
															</span>
															<Badge variant="secondary" className="text-xs">
																Week {week.number}
															</Badge>
															<span className="text-xs text-muted-foreground">
																{week.trainings.length} session
																{week.trainings.length !== 1 ? "s" : ""}
															</span>
														</button>
													</CollapsibleTrigger>
													<div className="flex gap-2 shrink-0">
														<Button
															size="sm"
															variant="ghost"
															className="h-7 text-xs"
															onClick={() => openEditWeek(week, block.id)}
														>
															Edit
														</Button>
														<Button
															size="sm"
															variant="ghost"
															className="h-7 text-xs"
															onClick={() => openCreateTraining(week.id)}
														>
															<Plus className="w-3 h-3 mr-1" />
															Session
														</Button>
														<Button
															size="sm"
															variant="ghost"
															className="h-7 text-xs text-destructive hover:text-destructive"
															onClick={() =>
																setDeleteWeekTarget({ week, blockId: block.id })
															}
														>
															Delete
														</Button>
													</div>
												</div>

												<CollapsibleContent>
													<div className="px-4 pb-3 space-y-2">
														{week.trainings.length === 0 && (
															<p className="text-xs text-muted-foreground pl-5">
																No sessions yet.
															</p>
														)}
														{week.trainings.map((training) => (
															<Collapsible
																key={training.id}
																open={openTrainings.has(training.id)}
																onOpenChange={() => toggleTraining(training.id)}
															>
																<div className="bg-muted/30 rounded">
																	<div className="flex items-center justify-between px-3 py-2">
																		<CollapsibleTrigger asChild>
																			<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">
																				{openTrainings.has(training.id) ? (
																					<ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />
																				) : (
																					<ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground" />
																				)}
																				<Dumbbell className="w-3 h-3 text-muted-foreground" />
																				<span className="text-sm font-medium">{training.name}</span>
																				<span className="text-xs text-muted-foreground">{formatDate(training.date)}</span>
																				{(training.trainingExercises?.length ?? 0) > 0 && (
																					<Badge variant="secondary" className="text-[10px] h-4 px-1">
																						{training.trainingExercises!.length} ex
																					</Badge>
																				)}
																			</button>
																		</CollapsibleTrigger>
																		<div className="flex gap-2 shrink-0">
																			<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEditTraining(training)}>Edit</Button>
																			<Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate(`/programs/${programId}/trainings/${training.id}`)}>Exercises →</Button>
																			<Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteTrainingTarget(training)}>Delete</Button>
																		</div>
																	</div>
																	<CollapsibleContent>
																		<div className="px-8 pb-3 space-y-1">
																			{(training.trainingExercises?.length ?? 0) === 0 ? (
																				<p className="text-xs text-muted-foreground italic">No exercises added yet.</p>
																			) : (
																				training.trainingExercises!.map((te) => (
																					<div key={te.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs py-1 border-t border-border/40 first:border-t-0">
																						<span className="font-medium">{te.exercise?.name ?? `#${te.exerciseId}`}</span>
																						<span className="text-muted-foreground">{te.sets}×{te.reps} @ {te.weight} kg</span>
																						{te.rpePlanned != null && (
																							<Badge variant="outline" className="text-[10px] h-4 px-1">RPE {te.rpePlanned}</Badge>
																						)}
																						{te.percentageOfMax != null && (
																							<span className="text-muted-foreground">{te.percentageOfMax}%</span>
																						)}
																					</div>
																				))
																			)}
																		</div>
																	</CollapsibleContent>
																</div>
															</Collapsible>
														))}
													</div>
												</CollapsibleContent>
											</Collapsible>
										</div>
									))}
								</CardContent>
							</CollapsibleContent>
						</Collapsible>
					</Card>
				))}
			</div>
			)}

			{/* ── Block Dialog ──────────────────────────────────────────────────── */}
			<Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle>
							{editingBlock ? "Edit Block" : "New Training Block"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={blockForm.handleSubmit(handleSaveBlock)}
						className="space-y-4 py-2"
					>
						<div className="space-y-1">
							<Label>Name</Label>
							<Input placeholder="e.g. Strength Foundation" {...blockForm.register("name")} />
							{blockForm.formState.errors.name && (
								<p className="text-sm text-red-500">
									{blockForm.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label>Description</Label>
							<Input placeholder="Optional" {...blockForm.register("description")} />
						</div>
						<DialogFooter>
							<Button variant="outline" type="button" onClick={() => setBlockDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={blockForm.formState.isSubmitting}>
								{blockForm.formState.isSubmitting ? "Saving…" : editingBlock ? "Save" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Week Dialog ───────────────────────────────────────────────────── */}
			<Dialog open={weekDialogOpen} onOpenChange={setWeekDialogOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle>{editingWeek ? "Edit Week" : "New Week"}</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={weekForm.handleSubmit(handleSaveWeek)}
						className="space-y-4 py-2"
					>
						<div className="space-y-1">
							<Label>Name</Label>
							<Input placeholder="e.g. Week 1" {...weekForm.register("name")} />
							{weekForm.formState.errors.name && (
								<p className="text-sm text-red-500">
									{weekForm.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label>Week Number</Label>
							<Input type="number" min={1} {...weekForm.register("number")} />
							{weekForm.formState.errors.number && (
								<p className="text-sm text-red-500">
									{weekForm.formState.errors.number.message}
								</p>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" type="button" onClick={() => setWeekDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={weekForm.formState.isSubmitting}>
								{weekForm.formState.isSubmitting ? "Saving…" : editingWeek ? "Save" : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Training Dialog ───────────────────────────────────────────────── */}
			<Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle>
							{editingTraining ? "Edit Session" : "New Session"}
						</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={trainingForm.handleSubmit(handleSaveTraining)}
						className="space-y-4 py-2"
					>
						<div className="space-y-1">
							<Label>Name</Label>
							<Input placeholder="e.g. Upper Body A" {...trainingForm.register("name")} />
							{trainingForm.formState.errors.name && (
								<p className="text-sm text-red-500">
									{trainingForm.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label>Date</Label>
							<Input type="date" {...trainingForm.register("date")} />
							{trainingForm.formState.errors.date && (
								<p className="text-sm text-red-500">
									{trainingForm.formState.errors.date.message}
								</p>
							)}
						</div>
						<DialogFooter>
							<Button variant="outline" type="button" onClick={() => setTrainingDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={trainingForm.formState.isSubmitting}>
								{trainingForm.formState.isSubmitting
									? "Saving…"
									: editingTraining
									? "Save"
									: "Create"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Delete Block ──────────────────────────────────────────────────── */}
			<AlertDialog
				open={!!deleteBlockTarget}
				onOpenChange={(o) => !o && setDeleteBlockTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete block?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete <strong>{deleteBlockTarget?.name}</strong>{" "}
							and all its weeks and sessions.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteBlock}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* ── Delete Week ───────────────────────────────────────────────────── */}
			<AlertDialog
				open={!!deleteWeekTarget}
				onOpenChange={(o) => !o && setDeleteWeekTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete week?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{" "}
							<strong>{deleteWeekTarget?.week.name}</strong> and all its sessions.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteWeek}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* ── Delete Training ───────────────────────────────────────────────── */}
			<AlertDialog
				open={!!deleteTrainingTarget}
				onOpenChange={(o) => !o && setDeleteTrainingTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete session?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{" "}
							<strong>{deleteTrainingTarget?.name}</strong> and all its exercises.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteTraining}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
