import { TrainingCalendarItem } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { ClientColor } from "../hooks/useClientColors";
import { SessionChip } from "./SessionChip";

interface DayColumnProps {
  date: Date;
  sessions: TrainingCalendarItem[];
  isToday: boolean;
  isCoach: boolean;
  getColor: (clientId: string) => ClientColor;
  onSessionClick: (session: TrainingCalendarItem) => void;
  onAddSession?: (date: Date) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function DayColumn({
  date,
  sessions,
  isToday,
  isCoach,
  getColor,
  onSessionClick,
  onAddSession,
}: DayColumnProps) {
  const dateStr = date.toISOString().split("T")[0];
  const { isOver, setNodeRef } = useDroppable({ id: dateStr, data: { date: dateStr } });

  return (
    <div className="flex flex-col flex-1 min-w-0 border-r border-border/40 last:border-r-0">
      {/* Column header */}
      <div
        className={cn(
          "flex flex-col items-center py-3 border-b border-border/40",
          isToday && "bg-primary/5",
        )}
      >
        <span className="text-xs text-muted-foreground font-medium">
          {DAY_LABELS[date.getDay()]}
        </span>
        <span
          className={cn(
            "text-lg font-semibold w-9 h-9 flex items-center justify-center rounded-full mt-0.5",
            isToday && "bg-primary text-primary-foreground",
          )}
        >
          {date.getDate()}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {MONTH_LABELS[date.getMonth()]}
        </span>
      </div>

      {/* Sessions area */}
      <div
        ref={setNodeRef}
        onClick={() => isCoach && sessions.length === 0 && onAddSession?.(date)}
        className={cn(
          "flex flex-col gap-1.5 p-2 flex-1 transition-colors",
          isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20",
          isCoach && sessions.length === 0 && "cursor-pointer hover:bg-muted/40 group",
        )}
      >
        {sessions.map((s) => (
          <SessionChip
            key={s.id}
            session={s}
            color={getColor(s.clientId)}
            showClientName={isCoach}
            isDraggable={isCoach}
            onClick={onSessionClick}
          />
        ))}

        {isCoach && sessions.length === 0 && (
          <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  );
}
