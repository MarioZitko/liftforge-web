import TrainingBlockApiClient from "@/api/training-block/training-block.api";
import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import { Training } from "@/api/training/training.types";
import ProgramsApiClient from "@/api/programs/programs.api";
import { Program } from "@/api/programs/programs.types";
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
import { ChevronDown, ChevronRight, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

export default function ClientProgramDetailPage() {
	const { programId } = useParams<{ programId: string }>();
	const navigate = useNavigate();

	const [program, setProgram] = useState<Program | null>(null);
	const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
	const [loading, setLoading] = useState(true);
	const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());
	const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());

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
			setOpenBlocks(new Set(blks.map((b) => b.id)));
			setOpenWeeks(new Set(blks.flatMap((b) => b.weeks.map((w) => w.id))));
		} catch (err) {
			showError(err, "Failed to load program.");
		} finally {
			setLoading(false);
		}
	}

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

			{/* Blocks */}
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
												</div>

												<CollapsibleContent>
													<div className="px-4 pb-3 space-y-2">
														{week.trainings.length === 0 && (
															<p className="text-xs text-muted-foreground pl-5">
																No sessions added yet.
															</p>
														)}
														{week.trainings.map((training: Training) => (
															<div
																key={training.id}
																className="flex items-center justify-between bg-muted/30 rounded px-3 py-2"
															>
																<div className="flex items-center gap-2">
																	<Dumbbell className="w-3 h-3 text-muted-foreground" />
																	<span className="text-sm font-medium">
																		{training.name}
																	</span>
																	<span className="text-xs text-muted-foreground">
																		{formatDate(training.date)}
																	</span>
																</div>
																<Button
																	size="sm"
																	variant="default"
																	className="h-7 text-xs"
																	onClick={() =>
																		navigate(
																			`/my-programs/${programId}/trainings/${training.id}`
																		)
																	}
																>
																	Log →
																</Button>
															</div>
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
		</div>
	);
}
