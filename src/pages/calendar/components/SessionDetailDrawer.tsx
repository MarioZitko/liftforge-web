import TrainingApiClient from "@/api/training/training.api";
import { TrainingCalendarItem } from "@/api/training/training.types";
import { Training } from "@/api/training/training.types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDate } from "@/lib/date";
import { CalendarDays, Dumbbell, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SessionDetailDrawerProps {
  session: TrainingCalendarItem | null;
  isCoach: boolean;
  onClose: () => void;
}

export function SessionDetailDrawer({
  session,
  isCoach,
  onClose,
}: SessionDetailDrawerProps) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setDetail(null);
      return;
    }
    setIsLoading(true);
    TrainingApiClient.getInstance()
      .getById(session.id)
      .then(setDetail)
      .finally(() => setIsLoading(false));
  }, [session?.id]);

  function handleOpenFull() {
    if (!session) return;
    const path = isCoach
      ? `/programs/${session.programId}/trainings/${session.id}`
      : `/my-programs/${session.programId}/trainings/${session.id}`;
    navigate(path);
    onClose();
  }

  return (
    <Drawer open={!!session} onClose={onClose} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            {session?.name ?? "Session"}
          </DrawerTitle>
          {session && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(session.date)}
              {isCoach && (
                <span className="ml-2">· {session.clientName}</span>
              )}
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && detail && (
            <div className="flex flex-col gap-2">
              {!detail.trainingExercises?.length && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No exercises added yet.
                </p>
              )}
              {detail.trainingExercises?.map((te, idx) => (
                <div
                  key={te.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                >
                  <span className="text-xs text-muted-foreground font-mono w-5 pt-0.5 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {te.exercise?.name ?? `Exercise #${te.exerciseId}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {te.sets} sets × {te.reps} reps
                      {te.weight ? ` @ ${te.weight} kg` : ""}
                      {te.rpePlanned ? ` · RPE ${te.rpePlanned}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={handleOpenFull} className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            {isCoach ? "Edit Session" : "Log Session"}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
