import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarView = "month" | "week";

interface CalendarShellProps {
  currentDate: Date;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (v: CalendarView) => void;
  filterBar?: React.ReactNode;
  actions?: React.ReactNode;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getWeekRange(date: Date): string {
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  if (sunday.getMonth() === saturday.getMonth()) {
    return `${MONTH_NAMES[sunday.getMonth()]} ${sunday.getDate()}–${saturday.getDate()}, ${sunday.getFullYear()}`;
  }
  return `${MONTH_NAMES[sunday.getMonth()]} ${sunday.getDate()} – ${MONTH_NAMES[saturday.getMonth()]} ${saturday.getDate()}, ${sunday.getFullYear()}`;
}

export function CalendarShell({
  currentDate,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  filterBar,
  actions,
}: CalendarShellProps) {
  const title =
    view === "month"
      ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      : getWeekRange(currentDate);

  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-border/40">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold min-w-[200px]">{title}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-8 text-xs"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {actions}

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
          {(["month", "week"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {v}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Filter bar slot */}
      {filterBar && <div>{filterBar}</div>}
    </div>
  );
}
