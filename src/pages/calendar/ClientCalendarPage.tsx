import { TrainingCalendarItem } from "@/api/training/training.types";
import { DndContext } from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCalendarSessions } from "./hooks/useCalendarSessions";
import { useClientColors } from "./hooks/useClientColors";
import { CalendarShell, CalendarView } from "./components/CalendarShell";
import { MonthView } from "./components/MonthView";
import { SessionDetailDrawer } from "./components/SessionDetailDrawer";
import { WeekView } from "./components/WeekView";

const VIEW_KEY = "liftforge-client-calendar-view";

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

// Client calendar uses a single fixed color (own sessions)
const CLIENT_SELF_ID = "__self__";

export default function ClientCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(
    () => (localStorage.getItem(VIEW_KEY) as CalendarView | null) ?? "month"
  );
  const [detailSession, setDetailSession] = useState<TrainingCalendarItem | null>(null);

  const { getColor } = useClientColors();
  const [dateFrom, dateTo] = useMemo(() => getDateRange(currentDate, view), [currentDate, view]);
  const { sessions, isLoading } = useCalendarSessions(dateFrom, dateTo, false);

  // Normalize clientId to self so color stays consistent
  const normalizedSessions = useMemo(() => {
    const result: typeof sessions = {};
    for (const [date, items] of Object.entries(sessions)) {
      result[date] = items.map((s) => ({ ...s, clientId: CLIENT_SELF_ID }));
    }
    return result;
  }, [sessions]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden px-4 pt-4 pb-0">
      <DndContext>
        <CalendarShell
          currentDate={currentDate}
          view={view}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={() => setCurrentDate(new Date())}
          onViewChange={handleViewChange}
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
              sessions={normalizedSessions}
              isCoach={false}
              getColor={getColor}
              onSessionClick={setDetailSession}
            />
          ) : (
            <WeekView
              currentDate={currentDate}
              sessions={normalizedSessions}
              isCoach={false}
              getColor={getColor}
              onSessionClick={setDetailSession}
            />
          )}
        </div>
      </DndContext>

      <SessionDetailDrawer
        session={detailSession}
        isCoach={false}
        onClose={() => setDetailSession(null)}
      />
    </div>
  );
}
