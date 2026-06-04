import { TrainingCalendarItem } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { ClientColor } from "../hooks/useClientColors";
import { SessionsByDate } from "../hooks/useCalendarSessions";
import { DayCell } from "./DayCell";

interface MonthViewProps {
  currentDate: Date;
  sessions: SessionsByDate;
  isCoach: boolean;
  getColor: (clientId: string) => ClientColor;
  onSessionClick: (session: TrainingCalendarItem) => void;
  onAddSession?: (date: Date) => void;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const cells: Date[] = [];
  // Pad start
  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push(new Date(year, month, 1 - (firstDay.getDay() - i)));
  }
  // Month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  // Pad end to complete last row
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push(new Date(year, month + 1, i));
    }
  }
  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function MonthView({
  currentDate,
  sessions,
  isCoach,
  getColor,
  onSessionClick,
  onAddSession,
}: MonthViewProps) {
  const today = new Date();
  const grid = getMonthGrid(currentDate);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {DAY_HEADERS.map((d) => (
          <div key={d} className={cn("py-2 text-center text-xs font-medium text-muted-foreground")}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        {grid.map((date, idx) => {
          const dateStr = date.toISOString().split("T")[0];
          const daySessions = sessions[dateStr] ?? [];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();

          return (
            <DayCell
              key={idx}
              date={date}
              sessions={daySessions}
              isCurrentMonth={isCurrentMonth}
              isToday={isSameDay(date, today)}
              isCoach={isCoach}
              getColor={getColor}
              onSessionClick={onSessionClick}
              onAddSession={onAddSession}
            />
          );
        })}
      </div>
    </div>
  );
}
