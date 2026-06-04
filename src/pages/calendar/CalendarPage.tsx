import TrainingApiClient from "@/api/training/training.api";
import { TrainingCalendarItem } from "@/api/training/training.types";
import { useClientStore } from "@/store/clientStore";
import { useCoachStore } from "@/store/coachStore";
import { useUserStore } from "@/store/userStore";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCalendarSessions } from "./hooks/useCalendarSessions";
import { useClientColors } from "./hooks/useClientColors";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AssignSessionDrawer } from "./components/AssignSessionDrawer";
import { CalendarShell, CalendarView } from "./components/CalendarShell";
import { ClientFilterBar } from "./components/ClientFilterBar";
import { MonthView } from "./components/MonthView";
import { ScheduleProgramDialog } from "./components/ScheduleProgramDialog";
import { SessionDetailDrawer } from "./components/SessionDetailDrawer";
import { WeekView } from "./components/WeekView";

const VIEW_KEY = "liftforge-calendar-view";

function getDateRange(date: Date, view: CalendarView): [string, string] {
  if (view === "month") {
    const year = date.getFullYear();
    const month = date.getMonth();
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];
    return [from, to];
  } else {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return [
      sunday.toISOString().split("T")[0],
      saturday.toISOString().split("T")[0],
    ];
  }
}

export default function CalendarPage() {
  const user = useUserStore((s) => s.user);
  const { coach, fetchCoach } = useCoachStore();
  const { clients, fetchClientsByCoach } = useClientStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(
    () => (localStorage.getItem(VIEW_KEY) as CalendarView | null) ?? "month"
  );
  const [activeClientIds, setActiveClientIds] = useState<Set<string>>(new Set());
  const [assignDate, setAssignDate] = useState<Date | null>(null);
  const [detailSession, setDetailSession] = useState<TrainingCalendarItem | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { getColor } = useClientColors();
  const [dateFrom, dateTo] = useMemo(() => getDateRange(currentDate, view), [currentDate, view]);
  const { sessions, isLoading, refetch } = useCalendarSessions(dateFrom, dateTo, true);

  useEffect(() => {
    if (user?.userId) fetchCoach(user.userId);
  }, [user?.userId]);

  useEffect(() => {
    if (coach?.id) fetchClientsByCoach(coach.id);
  }, [coach?.id]);

  const filteredSessions = useMemo(() => {
    if (activeClientIds.size === 0) return sessions;
    const result: typeof sessions = {};
    for (const [date, items] of Object.entries(sessions)) {
      const filtered = items.filter((s) => activeClientIds.has(s.clientId));
      if (filtered.length > 0) result[date] = filtered;
    }
    return result;
  }, [sessions, activeClientIds]);

  function handleViewChange(v: CalendarView) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  function handlePrev() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") next.setMonth(d.getMonth() - 1);
      else next.setDate(d.getDate() - 7);
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "month") next.setMonth(d.getMonth() + 1);
      else next.setDate(d.getDate() + 7);
      return next;
    });
  }

  function toggleClient(clientId: string) {
    setActiveClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const session = active.data.current?.session as TrainingCalendarItem | undefined;
      const newDate = over.data.current?.date as string | undefined;
      if (!session || !newDate || session.date === newDate) return;

      try {
        await TrainingApiClient.getInstance().update(session.id, { date: newDate });
        refetch();
        toast.success("Session rescheduled");
      } catch {
        toast.error("Failed to reschedule session");
      }
    },
    [refetch]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden px-4 pt-4 pb-0">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <CalendarShell
          currentDate={currentDate}
          view={view}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={() => setCurrentDate(new Date())}
          onViewChange={handleViewChange}
          actions={
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setScheduleOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Schedule Program
            </Button>
          }
          filterBar={
            <ClientFilterBar
              clients={clients}
              activeClientIds={activeClientIds}
              getColor={getColor}
              onToggle={toggleClient}
            />
          }
        />

        <div className="flex-1 overflow-hidden mt-3 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {view === "month" ? (
            <MonthView
              currentDate={currentDate}
              sessions={filteredSessions}
              isCoach={true}
              getColor={getColor}
              onSessionClick={setDetailSession}
              onAddSession={setAssignDate}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              sessions={filteredSessions}
              isCoach={true}
              getColor={getColor}
              onSessionClick={setDetailSession}
              onAddSession={setAssignDate}
            />
          )}
        </div>
      </DndContext>

      <ScheduleProgramDialog
        open={scheduleOpen}
        clients={clients}
        onClose={() => setScheduleOpen(false)}
        onScheduled={refetch}
      />

      <AssignSessionDrawer
        open={!!assignDate}
        date={assignDate}
        clients={clients}
        onClose={() => setAssignDate(null)}
        onCreated={refetch}
      />

      <SessionDetailDrawer
        session={detailSession}
        isCoach={true}
        onClose={() => setDetailSession(null)}
      />
    </div>
  );
}
