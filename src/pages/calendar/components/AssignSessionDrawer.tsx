import TrainingBlockApiClient from "@/api/training-block/training-block.api";
import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import ClientProgramApiClient from "@/api/client-program/client-program.api";
import { ClientProgramAssignment } from "@/api/client-program/client-program.types";
import TrainingApiClient from "@/api/training/training.api";
import { Client } from "@/api/client/client.types";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AssignSessionDrawerProps {
  open: boolean;
  date: Date | null;
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}

type Step = "client" | "program" | "week" | "name";

export function AssignSessionDrawer({
  open,
  date,
  clients,
  onClose,
  onCreated,
}: AssignSessionDrawerProps) {
  const [step, setStep] = useState<Step>("client");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<ClientProgramAssignment[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ClientProgramAssignment | null>(null);
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<TrainingWeekSummary | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset when drawer opens
  useEffect(() => {
    if (open) {
      setStep("client");
      setSelectedClient(null);
      setPrograms([]);
      setSelectedProgram(null);
      setBlocks([]);
      setSelectedWeek(null);
      setSessionName("");
    }
  }, [open]);

  async function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setIsLoadingPrograms(true);
    try {
      const all = await ClientProgramApiClient.getInstance().getMyCoachPrograms();
      setPrograms(all.filter((p) => p.clientId === client.id));
      setStep("program");
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
      setStep("week");
    } finally {
      setIsLoadingBlocks(false);
    }
  }

  function handleSelectWeek(week: TrainingWeekSummary) {
    setSelectedWeek(week);
    setStep("name");
  }

  async function handleCreate() {
    if (!selectedWeek || !date || !sessionName.trim()) return;
    setIsSaving(true);
    try {
      await TrainingApiClient.getInstance().create({
        name: sessionName.trim(),
        date: date.toISOString().split("T")[0],
        weekId: selectedWeek.id,
      });
      toast.success("Session added to calendar");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create session");
    } finally {
      setIsSaving(false);
    }
  }

  const formattedDate = date
    ? date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <Drawer open={open} onClose={onClose} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Assign Session
          </DrawerTitle>
          {date && (
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4 flex-wrap">
            <span className={cn(step === "client" && "text-foreground font-medium")}>Client</span>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <span className={cn(step === "program" && "text-foreground font-medium", (step === "client") && "opacity-40")}>Program</span>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <span className={cn(step === "week" && "text-foreground font-medium", ["client", "program"].includes(step) && "opacity-40")}>Week</span>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <span className={cn(step === "name" && "text-foreground font-medium", step !== "name" && "opacity-40")}>Name</span>
          </div>

          {/* Step: client */}
          {step === "client" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium mb-1">Select a client</p>
              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground">No clients assigned to you yet.</p>
              )}
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClient(c)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {(c.user?.name ?? c.user?.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.user?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                  </div>
                </button>
              ))}
              {isLoadingPrograms && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto mt-4" />}
            </div>
          )}

          {/* Step: program */}
          {step === "program" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setStep("client")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                <p className="text-sm font-medium">Select a program</p>
              </div>
              {programs.length === 0 && (
                <p className="text-sm text-muted-foreground">No active programs for this client.</p>
              )}
              {programs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProgram(p)}
                  className="flex flex-col items-start p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors"
                >
                  <p className="text-sm font-medium">{p.program?.name ?? p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.status}</p>
                </button>
              ))}
              {isLoadingBlocks && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto mt-4" />}
            </div>
          )}

          {/* Step: week */}
          {step === "week" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setStep("program")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                <p className="text-sm font-medium">Select a training week</p>
              </div>
              {blocks.map((block) => (
                <div key={block.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1 mt-2">{block.name}</p>
                  {block.weeks?.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => handleSelectWeek(week)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors mb-1"
                    >
                      <p className="text-sm font-medium">{week.name}</p>
                      <p className="text-xs text-muted-foreground">Week {week.number}</p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Step: name */}
          {step === "name" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setStep("week")} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
                <p className="text-sm font-medium">Name your session</p>
              </div>
              <div className="rounded-lg border border-border p-3 bg-muted/30 text-xs text-muted-foreground space-y-0.5">
                <p><span className="font-medium">Client:</span> {selectedClient?.user?.name}</p>
                <p><span className="font-medium">Program:</span> {selectedProgram?.program?.name ?? selectedProgram?.name}</p>
                <p><span className="font-medium">Week:</span> {selectedWeek?.name}</p>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Upper Body A"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        </div>

        <DrawerFooter>
          {step === "name" && (
            <Button
              onClick={handleCreate}
              disabled={!sessionName.trim() || isSaving}
              className="w-full"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Session
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
