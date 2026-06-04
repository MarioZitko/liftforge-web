import { TrainingCalendarItem } from "@/api/training/training.types";
import { SessionsByDate } from "../hooks/useCalendarSessions";
import { ClientColor } from "../hooks/useClientColors";
import { DayColumn } from "./DayColumn";

interface WeekViewProps {
  currentDate: Date;
  sessions: SessionsByDate;
  isCoach: boolean;
  getColor: (clientId: string) => ClientColor;
  onSessionClick: (session: TrainingCalendarItem) => void;
  onAddSession?: (date: Date) => void;
}

function getWeekDays(date: Date): Date[] {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function WeekView({
  currentDate,
  sessions,
  isCoach,
  getColor,
  onSessionClick,
  onAddSession,
}: WeekViewProps) {
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="flex flex-1 overflow-hidden">
      {weekDays.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        return (
          <DayColumn
            key={dateStr}
            date={date}
            sessions={sessions[dateStr] ?? []}
            isToday={isSameDay(date, today)}
            isCoach={isCoach}
            getColor={getColor}
            onSessionClick={onSessionClick}
            onAddSession={onAddSession}
          />
        );
      })}
    </div>
  );
}
