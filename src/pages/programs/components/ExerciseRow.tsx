import { TrainingExerciseSummary } from "@/api/training/training.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VideoLink } from "./VideoLink";

interface ExerciseRowProps {
  te: TrainingExerciseSummary;
  variant: "coach" | "client";
}

function isLogged(te: TrainingExerciseSummary) {
  return te.rpeActual != null || (te.note && te.note.trim());
}

export function ExerciseRow({ te, variant }: ExerciseRowProps) {
  const logged = isLogged(te);

  return (
    <div
      className={cn(
        "grid gap-x-2 py-1 text-xs border-t border-border/40 first:border-t-0",
        variant === "client" ? "grid-cols-[1fr_auto]" : "grid-cols-1"
      )}
    >
      <span className="font-medium truncate">
        {te.exercise?.name ?? `#${te.exerciseId}`}
      </span>

      {variant === "coach" && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span className="text-muted-foreground">
            {te.sets}×{te.reps} @ {te.weight} kg
          </span>
          {te.rpePlanned != null && (
            <span className="text-muted-foreground">· RPE {te.rpePlanned}</span>
          )}
          {te.percentageOfMax != null && (
            <span className="text-muted-foreground">· {te.percentageOfMax}%</span>
          )}
        </div>
      )}

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
                <VideoLink href={te.videoUrl} className="text-[10px]" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
