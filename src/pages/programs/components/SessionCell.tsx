import { Training, TrainingExerciseSummary } from "@/api/training/training.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import { CheckCircle2, ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { ExerciseRow } from "./ExerciseRow";

interface SessionCellProps {
  session: Training;
  variant: "coach" | "client";
  onSessionClick: (t: Training) => void;
  onEditSession?: (t: Training) => void;
  onDeleteSession?: (t: Training) => void;
}

function isExerciseLogged(te: TrainingExerciseSummary) {
  return te.rpeActual != null || (te.note && te.note.trim());
}

export function SessionCell({
  session,
  variant,
  onSessionClick,
  onEditSession,
  onDeleteSession,
}: SessionCellProps) {
  const [expanded, setExpanded] = useState(false);
  const exercises = session.trainingExercises ?? [];
  const loggedCount =
    variant === "client" ? exercises.filter(isExerciseLogged).length : 0;
  const allLogged = loggedCount > 0 && loggedCount === exercises.length;

  const showActions = variant === "coach" && (onEditSession || onDeleteSession);

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
            <p className="text-[11px] text-muted-foreground">{formatDate(session.date)}</p>
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
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {onEditSession && (
                  <DropdownMenuItem onClick={() => onEditSession(session)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onEditSession && onDeleteSession && <DropdownMenuSeparator />}
                {onDeleteSession && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteSession(session)}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Collapsed: show exercise count as a hint */}
      {!expanded && exercises.length > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors text-left"
        >
          {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} — click to expand
        </button>
      )}

      {/* Expanded: full exercise list */}
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
