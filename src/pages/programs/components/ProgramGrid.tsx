import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import { Training, TrainingExerciseSummary } from "@/api/training/training.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProgramGridProps {
  blocks: TrainingBlock[];
  variant: "coach" | "client";
  /** Called when the user clicks the action button in a session cell */
  onSessionClick: (training: Training) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function isExerciseLogged(te: TrainingExerciseSummary) {
  return te.rpeActual != null || (te.note && te.note.trim());
}

function sessionLoggedCount(training: Training) {
  return (training.trainingExercises ?? []).filter(isExerciseLogged).length;
}

// ── Exercise row inside a cell ─────────────────────────────────────────────────

function ExerciseRow({
  te,
  variant,
}: {
  te: TrainingExerciseSummary;
  variant: "coach" | "client";
}) {
  const logged = isExerciseLogged(te);

  return (
    <div
      className={cn(
        "grid gap-x-2 py-1 text-xs border-t border-border/40 first:border-t-0",
        variant === "client"
          ? "grid-cols-[1fr_auto]"
          : "grid-cols-1"
      )}
    >
      {/* Exercise name */}
      <span className="font-medium truncate">
        {te.exercise?.name ?? `#${te.exerciseId}`}
      </span>

      {/* Coach: one line — planned only */}
      {variant === "coach" && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span className="text-muted-foreground">
            {te.sets}×{te.reps} @ {te.weight} kg
          </span>
          {te.rpePlanned != null && (
            <span className="text-muted-foreground">· RPE {te.rpePlanned}</span>
          )}
          {te.percentageOfMax != null && (
            <span className="text-muted-foreground">
              · {te.percentageOfMax}%
            </span>
          )}
        </div>
      )}

      {/* Client: planned row + logged row */}
      {variant === "client" && (
        <>
          <div className="col-span-2 mt-0.5 text-muted-foreground">
            Plan: {te.sets}×{te.reps} @ {te.weight} kg
            {te.rpePlanned != null && ` · RPE ${te.rpePlanned}`}
          </div>
          {logged && (
            <div className="col-span-2 flex flex-wrap gap-1 mt-0.5">
              {te.rpeActual != null && (
                <Badge className="text-[10px] h-4 px-1 bg-emerald-600 hover:bg-emerald-600">
                  RPE {te.rpeActual}
                </Badge>
              )}
              {te.note && te.note.trim() && (
                <span className="text-[10px] italic text-muted-foreground truncate max-w-[120px]">
                  {te.note}
                </span>
              )}
              {te.videoUrl && te.videoUrl.trim() && (
                <a
                  href={te.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-500 underline flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  Video
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Session cell ──────────────────────────────────────────────────────────────

function SessionCell({
  session,
  variant,
  onSessionClick,
}: {
  session: Training;
  variant: "coach" | "client";
  onSessionClick: (t: Training) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const exercises = session.trainingExercises ?? [];
  const loggedCount = variant === "client" ? sessionLoggedCount(session) : 0;
  const allLogged = loggedCount > 0 && loggedCount === exercises.length;

  return (
    <div className="flex flex-col h-full">
      {/* Session header */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1 min-w-0">
          {exercises.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse exercises" : "Expand exercises"}
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-xs leading-tight">{session.name}</p>
            <p className="text-[11px] text-muted-foreground">{shortDate(session.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {variant === "client" && exercises.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {loggedCount}/{exercises.length}
              {allLogged && (
                <CheckCircle2 className="inline w-3 h-3 text-emerald-500 ml-0.5" />
              )}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={() => onSessionClick(session)}
          >
            {variant === "client" ? "Log →" : "View →"}
          </Button>
        </div>
      </div>

      {/* Exercise count chip when collapsed */}
      {!expanded && exercises.length > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left"
        >
          {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} — click to expand
        </button>
      )}

      {/* Exercise list when expanded */}
      {expanded && (
        <div className="flex-1">
          {exercises.map((te) => (
            <ExerciseRow key={te.id} te={te} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Block grid ────────────────────────────────────────────────────────────────

function BlockGrid({
  block,
  variant,
  onSessionClick,
}: {
  block: TrainingBlock;
  variant: "coach" | "client";
  onSessionClick: (t: Training) => void;
}) {
  const weeks: TrainingWeekSummary[] = block.weeks;
  const maxSessions = Math.max(...weeks.map((w) => w.trainings.length), 0);

  if (weeks.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-3">
          <h3 className="font-bold text-sm uppercase tracking-wide">{block.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground p-4">No weeks added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Block header */}
      <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-3 flex items-center gap-4">
        <h3 className="font-bold text-sm uppercase tracking-wide">{block.name}</h3>
        {block.description && (
          <span className="text-slate-400 text-xs">{block.description}</span>
        )}
        <span className="ml-auto text-slate-400 text-xs">
          {weeks.length} week{weeks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          {/* Week column headers */}
          <thead>
            <tr>
              {/* Row-label column */}
              <th className="bg-slate-700 dark:bg-slate-800 text-white sticky left-0 z-10 w-10 min-w-[40px] p-0" />

              {weeks.map((week) => {
                const firstDate = week.trainings[0]?.date;
                const lastDate = week.trainings[week.trainings.length - 1]?.date;
                return (
                  <th
                    key={week.id}
                    className="bg-slate-700 dark:bg-slate-800 text-white p-3 text-left min-w-[220px] border-l border-slate-600 align-top"
                  >
                    <div className="font-bold text-xs uppercase tracking-wide">
                      {week.name}
                    </div>
                    <div className="text-slate-300 text-[11px] mt-0.5">
                      Week #{week.number}
                      {firstDate && (
                        <span className="ml-2">
                          {shortDate(firstDate)}
                          {lastDate && lastDate !== firstDate
                            ? ` – ${shortDate(lastDate)}`
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      {week.trainings.length} session
                      {week.trainings.length !== 1 ? "s" : ""}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Session rows */}
          <tbody>
            {maxSessions === 0 ? (
              <tr>
                <td
                  colSpan={weeks.length + 1}
                  className="text-center text-sm text-muted-foreground p-6"
                >
                  No sessions added yet.
                </td>
              </tr>
            ) : (
              Array.from({ length: maxSessions }, (_, slotIdx) => (
                <tr
                  key={slotIdx}
                  className={cn(
                    "border-t border-border",
                    slotIdx % 2 === 1 ? "bg-muted/20" : "bg-background"
                  )}
                >
                  {/* Slot label */}
                  <td className="bg-slate-100 dark:bg-slate-900 sticky left-0 z-10 p-2 text-center align-top border-r border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {slotIdx + 1}
                    </span>
                  </td>

                  {/* Session cell per week */}
                  {weeks.map((week) => {
                    const session: Training | undefined =
                      week.trainings[slotIdx];
                    return (
                      <td
                        key={week.id}
                        className="p-3 align-top border-l border-border min-w-[220px] max-w-[280px]"
                      >
                        {session ? (
                          <SessionCell
                            session={session}
                            variant={variant}
                            onSessionClick={onSessionClick}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function ProgramGrid({
  blocks,
  variant,
  onSessionClick,
}: ProgramGridProps) {
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No training blocks yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockGrid
          key={block.id}
          block={block}
          variant={variant}
          onSessionClick={onSessionClick}
        />
      ))}
    </div>
  );
}
