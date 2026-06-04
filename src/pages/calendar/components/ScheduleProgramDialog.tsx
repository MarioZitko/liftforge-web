import TrainingBlockApiClient from "@/api/training-block/training-block.api";
import { TrainingBlock } from "@/api/training-block/training-block.types";
import ClientProgramApiClient from "@/api/client-program/client-program.api";
import { ClientProgramAssignment } from "@/api/client-program/client-program.types";
import TrainingApiClient from "@/api/training/training.api";
import { Client } from "@/api/client/client.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ScheduleProgramDialogProps {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onScheduled: () => void;
}

const DAY_LABELS = [
  { label: "S", fullLabel: "Sun", value: 0 },
  { label: "M", fullLabel: "Mon", value: 1 },
  { label: "T", fullLabel: "Tue", value: 2 },
  { label: "W", fullLabel: "Wed", value: 3 },
  { label: "T", fullLabel: "Thu", value: 4 },
  { label: "F", fullLabel: "Fri", value: 5 },
  { label: "S", fullLabel: "Sat", value: 6 },
];

function countSessions(blocks: TrainingBlock[]): number {
  return blocks.reduce(
    (sum, b) => sum + b.weeks.reduce((s, w) => s + (w.trainings?.length ?? 0), 0),
    0
  );
}

function estimateEndDate(startDate: string, trainingDays: number[], totalSessions: number): string | null {
  if (!startDate || trainingDays.length === 0 || totalSessions === 0) return null;
  const sorted = [...new Set(trainingDays)].sort((a, b) => a - b);
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  let found = 0;
  let safety = 0;
  let last = cursor;
  while (found < totalSessions && safety < 1000) {
    if (sorted.includes(cursor.getDay())) {
      last = new Date(cursor);
      found++;
    }
    cursor.setDate(cursor.getDate() + 1);
    safety++;
  }
  return last.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ScheduleProgramDialog({
  open,
  clients,
  onClose,
  onScheduled,
}: ScheduleProgramDialogProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<ClientProgramAssignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ClientProgramAssignment | null>(null);
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [trainingDays, setTrainingDays] = useState<number[]>([1, 3, 5]); // Mon/Wed/Fri default
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedClient(null);
      setPrograms([]);
      setSelectedProgram(null);
      setBlocks([]);
      setStartDate(new Date().toISOString().split("T")[0]);
      setTrainingDays([1, 3, 5]);
    }
  }, [open]);

  async function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setSelectedProgram(null);
    setBlocks([]);
    setIsLoadingPrograms(true);
    try {
      const all = await ClientProgramApiClient.getInstance().getMyCoachPrograms();
      setPrograms(all.filter((p) => p.clientId === client.id));
    } finally {
      setIsLoadingPrograms(false);
    }
  }

  async function handleSelectProgram(program: ClientProgramAssignment) {
    setSelectedProgram(program);
    setIsLoadingBlocks(true);
    try {
      const blks = await TrainingBlockApiClient.getInstance().getByProgram(program.programId);
      setBlocks(blks);
    } finally {
      setIsLoadingBlocks(false);
    }
  }

  function toggleDay(day: number) {
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  }

  const totalSessions = useMemo(() => countSessions(blocks), [blocks]);
  const endDatePreview = useMemo(
    () => estimateEndDate(startDate, trainingDays, totalSessions),
    [startDate, trainingDays, totalSessions]
  );

  const canSchedule =
    selectedProgram && trainingDays.length > 0 && startDate && totalSessions > 0;

  async function handleSchedule() {
    if (!canSchedule || !selectedProgram) return;
    setIsSaving(true);
    try {
      const result = await TrainingApiClient.getInstance().scheduleProgram({
        programId: selectedProgram.programId,
        startDate,
        trainingDays,
      });
      toast.success(`${result.scheduledCount} sessions scheduled on the calendar`);
      onScheduled();
      onClose();
    } catch {
      toast.error("Failed to schedule program");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Schedule Program
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          {/* Step 1: Client */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Client</p>
            <div className="flex flex-wrap gap-2">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-all",
                    selectedClient?.id === c.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {c.user?.name ?? c.user?.email ?? "Client"}
                </button>
              ))}
              {isLoadingPrograms && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground self-center" />}
            </div>
          </div>

          {/* Step 2: Program */}
          {selectedClient && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Program</p>
              {programs.length === 0 && !isLoadingPrograms && (
                <p className="text-xs text-muted-foreground">No programs assigned to this client.</p>
              )}
              <div className="flex flex-col gap-1.5">
                {programs.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProgram(p)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all",
                      selectedProgram?.id === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <span className="text-sm font-medium">{p.program?.name ?? p.name}</span>
                    <span className={cn("text-xs capitalize px-1.5 py-0.5 rounded-full",
                      p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    )}>{p.status}</span>
                  </button>
                ))}
                {isLoadingBlocks && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />}
              </div>
            </div>
          )}

          {/* Step 3: Start date + training days */}
          {selectedProgram && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Start date</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Training days</p>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((d) => (
                    <button
                      key={d.value}
                      title={d.fullLabel}
                      onClick={() => toggleDay(d.value)}
                      className={cn(
                        "w-9 h-9 rounded-full text-xs font-semibold border transition-all",
                        trainingDays.includes(d.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {trainingDays.length === 0 && (
                  <p className="text-xs text-destructive">Select at least one training day.</p>
                )}
              </div>

              {/* Preview */}
              {totalSessions > 0 && endDatePreview && trainingDays.length > 0 && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <CalendarDays className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground">
                    <span className="font-medium">{totalSessions} sessions</span> will be scheduled,
                    starting <span className="font-medium">{new Date(startDate + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span> through <span className="font-medium">{endDatePreview}</span>.
                  </div>
                </div>
              )}

              {totalSessions === 0 && !isLoadingBlocks && (
                <p className="text-xs text-muted-foreground">This program has no sessions to schedule.</p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleSchedule}
            disabled={!canSchedule || isSaving}
            className="w-full gap-2"
          >
            {isSaving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />
            }
            Schedule Program
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
