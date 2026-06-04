import { TrainingCalendarItem } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { ClientColor } from "../hooks/useClientColors";
import { SessionChip } from "./SessionChip";

interface DayCellProps {
  date: Date;
  sessions: TrainingCalendarItem[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isCoach: boolean;
  getColor: (clientId: string) => ClientColor;
  onSessionClick: (session: TrainingCalendarItem) => void;
  onAddSession?: (date: Date) => void;
}

const MAX_VISIBLE = 3;

export function DayCell({
  date,
  sessions,
  isCurrentMonth,
  isToday,
  isCoach,
  getColor,
  onSessionClick,
  onAddSession,
}: DayCellProps) {
  const dateStr = date.toISOString().split("T")[0];
  const { isOver, setNodeRef } = useDroppable({ id: dateStr, data: { date: dateStr } });

  const visible = sessions.slice(0, MAX_VISIBLE);
  const overflow = sessions.length - MAX_VISIBLE;

  return (
    <div
      ref={setNodeRef}
      onClick={() => isCoach && onAddSession?.(date)}
      className={cn(
        "relative flex flex-col gap-1 min-h-[100px] p-1.5 border-b border-r border-border/40",
        "transition-colors",
        !isCurrentMonth && "bg-muted/30",
        isOver && "bg-primary/5 ring-1 ring-inset ring-primary/30",
        isCoach && sessions.length === 0 && "cursor-pointer hover:bg-muted/50 group",
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
            isToday && "bg-primary text-primary-foreground",
            !isToday && isCurrentMonth && "text-foreground",
            !isToday && !isCurrentMonth && "text-muted-foreground",
          )}
        >
          {date.getDate()}
        </span>
        {sessions.length > 0 && (
          <span className="text-[10px] text-muted-foreground pr-0.5">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Session chips */}
      <div className="flex flex-col gap-0.5">
        {visible.map((s) => (
          <SessionChip
            key={s.id}
            session={s}
            color={getColor(s.clientId)}
            showClientName={isCoach}
            isDraggable={isCoach}
            onClick={onSessionClick}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-muted-foreground px-1">
            +{overflow} more
          </span>
        )}
      </div>

      {/* Add session hint — coach only, empty cells */}
      {isCoach && sessions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Plus className="w-4 h-4 text-muted-foreground/60" />
        </div>
      )}
    </div>
  );
}
