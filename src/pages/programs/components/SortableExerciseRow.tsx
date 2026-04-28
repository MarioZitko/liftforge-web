import { TrainingExercise } from "@/api/training-exercise/training-exercise.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableExerciseRowProps {
  te: TrainingExercise;
  onEdit: (te: TrainingExercise) => void;
  onDelete: (te: TrainingExercise) => void;
}

export function SortableExerciseRow({ te, onEdit, onDelete }: SortableExerciseRowProps) {
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
      {/* Drag handle — raw <button> is required by dnd-kit for ref/listener spreading */}
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
        <Button size="sm" variant="outline" onClick={() => onEdit(te)}>Edit</Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(te)}>Delete</Button>
      </div>
    </div>
  );
}
