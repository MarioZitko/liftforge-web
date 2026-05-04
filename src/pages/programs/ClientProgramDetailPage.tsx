import TrainingBlockApiClient from "@/api/training-block/training-block.api";
import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import { Training } from "@/api/training/training.types";
import ProgramsApiClient from "@/api/programs/programs.api";
import { Program } from "@/api/programs/programs.types";
import { ProgramGrid } from "./components/ProgramGrid";
import { ViewToggle } from "./components/ViewToggle";
import { showError } from "@/components/shared/utils/toast.util";
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
import { PageLoader } from "@/components/page/PageLoader";
import { useToggleSet } from "@/hooks/useToggleSet";
import { formatDate } from "@/lib/date";
import { ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import { useProgramView } from "@/hooks/useProgramView";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ClientProgramDetailPage() {
	const { programId } = useParams<{ programId: string }>();
	const navigate = useNavigate();

	const [program, setProgram] = useState<Program | null>(null);
	const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useProgramView();

	const { set: openBlocks, toggle: toggleBlock, init: initBlocks } = useToggleSet();
	const { set: openWeeks, toggle: toggleWeek, init: initWeeks } = useToggleSet();
	const { set: openTrainings, toggle: toggleTraining } = useToggleSet();

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
			// Auto-expand everything so the client sees the full structure immediately
			initBlocks(blks.map((b) => b.id));
			initWeeks(blks.flatMap((b) => b.weeks.map((w) => w.id)));
		} catch (err) {
			showError(err, "Failed to load program.");
		} finally {
			setLoading(false);
		}
	}

	if (loading) return <PageLoader />;

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => navigate("/my-programs")}>
					← My Programs
				</Button>
				<div>
					<h1 className="text-2xl font-bold">{program?.name ?? "Program"}</h1>
					{program?.description && (
						<p className="text-sm text-muted-foreground">{program.description}</p>
					)}
				</div>
			</div>

			{/* View toggle */}
			<div className="flex items-center justify-end">
				<ViewToggle view={view} onViewChange={setView} />
			</div>

			{/* Grid view */}
			{view === "grid" && (
				<ProgramGrid
					blocks={blocks}
					variant="client"
					onSessionClick={(t) =>
						navigate(`/my-programs/${programId}/trainings/${t.id}`)
					}
				/>
			)}

			{/* List view */}
			{view === "list" && (
			<div className="space-y-4">
				{blocks.length === 0 && (
					<p className="text-muted-foreground text-sm">
						No content yet — your coach hasn't added any training blocks.
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
									<Badge variant="outline" className="text-xs ml-4 shrink-0">
										{block.weeks.length} week{block.weeks.length !== 1 ? "s" : ""}
									</Badge>
								</div>
							</CardHeader>

							<CollapsibleContent>
								<CardContent className="pt-0 space-y-3">
									{block.weeks.length === 0 && (
										<p className="text-sm text-muted-foreground pl-6">
											No weeks added yet.
										</p>
									)}

									{block.weeks.map((week: TrainingWeekSummary) => (
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
															<span className="font-medium text-sm">{week.name}</span>
															<Badge variant="secondary" className="text-xs">
																Week {week.number}
															</Badge>
															<span className="text-xs text-muted-foreground">
																{week.trainings.length} session
																{week.trainings.length !== 1 ? "s" : ""}
															</span>
														</button>
													</CollapsibleTrigger>
												</div>

												<CollapsibleContent>
													<div className="px-4 pb-3 space-y-2">
														{week.trainings.length === 0 && (
															<p className="text-xs text-muted-foreground pl-5">
																No sessions added yet.
															</p>
														)}
														{week.trainings.map((training: Training) => (
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
																		<Button
																			size="sm"
																			variant="default"
																			className="h-7 text-xs shrink-0"
																			onClick={() =>
																				navigate(`/my-programs/${programId}/trainings/${training.id}`)
																			}
																		>
																			Log →
																		</Button>
																	</div>
																	<CollapsibleContent>
																		<div className="px-8 pb-3 space-y-1">
																			{(training.trainingExercises?.length ?? 0) === 0 ? (
																				<p className="text-xs text-muted-foreground italic">No exercises added yet.</p>
																			) : (
																				training.trainingExercises!.map((te) => (
																					<div key={te.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs py-1 border-t border-border/40 first:border-t-0">
																						<span className="font-medium">{te.exercise?.name ?? `#${te.exerciseId}`}</span>
																						<span className="text-muted-foreground">
																							{te.sets}×{te.reps} @ {te.weight} kg
																						</span>
																						{te.rpePlanned != null && (
																							<Badge variant="outline" className="text-[10px] h-4 px-1">RPE {te.rpePlanned}</Badge>
																						)}
																						{te.rpeActual != null && (
																							<Badge className="text-[10px] h-4 px-1 bg-emerald-600 hover:bg-emerald-600">Actual RPE {te.rpeActual}</Badge>
																						)}
																						{te.note && te.note.trim() && (
																							<span className="text-muted-foreground italic truncate max-w-[160px]">{te.note}</span>
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
		</div>
	);
}
