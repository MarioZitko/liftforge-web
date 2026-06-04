import { TrainingCalendarItem } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { Dumbbell } from "lucide-react";
import { ClientColor } from "../hooks/useClientColors";

interface SessionChipProps {
  session: TrainingCalendarItem;
  color: ClientColor;
  showClientName: boolean;
  isDraggable: boolean;
  onClick: (session: TrainingCalendarItem) => void;
}

export function SessionChip({
  session,
  color,
  showClientName,
  isDraggable,
  onClick,
}: SessionChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `session-${session.id}`,
    data: { session },
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(isDraggable ? { ...listeners, ...attributes } : {})}
      onClick={(e) => {
        e.stopPropagation();
        onClick(session);
      }}
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        "border-l-2 cursor-pointer select-none",
        "hover:opacity-90 transition-opacity",
        color.chip,
        color.border,
        isDragging && "opacity-40",
        isDraggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <span className="truncate flex-1 leading-tight">
        {showClientName ? session.clientName : session.name}
      </span>
      {session.exerciseCount > 0 && (
        <span className={cn("flex items-center gap-0.5 shrink-0 text-[10px] opacity-70")}>
          <Dumbbell className="w-2.5 h-2.5" />
          {session.exerciseCount}
        </span>
      )}
    </div>
  );
}
