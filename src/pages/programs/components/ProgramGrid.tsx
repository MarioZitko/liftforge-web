import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import { Training } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { SessionCell } from "./SessionCell";

interface ProgramGridProps {
  blocks: TrainingBlock[];
  variant: "coach" | "client";
  onSessionClick: (training: Training) => void;
}

function BlockGrid({
  block,
  variant,
  onSessionClick,
}: {
  block: TrainingBlock;
  variant: "coach" | "client";
  onSessionClick: (t: Training) => void;
}) {
  const weeks: TrainingWeekSummary[] = block.weeks;
  const maxSessions = Math.max(...weeks.map((w) => w.trainings.length), 0);

  const headerCls = "bg-primary text-primary-foreground";
  const subHeaderCls = "bg-primary/90 text-primary-foreground";
  const headerBorderCls = "border-primary/30";

  if (weeks.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className={cn(headerCls, "px-4 py-3")}>
          <h3 className="font-bold text-sm uppercase tracking-wide">{block.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground p-4">No weeks added yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Block header */}
      <div className={cn(headerCls, "px-4 py-3 flex items-center gap-4")}>
        <h3 className="font-bold text-sm uppercase tracking-wide">{block.name}</h3>
        {block.description && (
          <span className="text-primary-foreground/60 text-xs">{block.description}</span>
        )}
        <span className="ml-auto text-primary-foreground/60 text-xs">
          {weeks.length} week{weeks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              {/* Row-label column */}
              <th className={cn(subHeaderCls, "sticky left-0 z-10 w-10 min-w-[40px] p-0")} />

              {weeks.map((week) => {
                const firstDate = week.trainings[0]?.date;
                const lastDate = week.trainings[week.trainings.length - 1]?.date;
                return (
                  <th
                    key={week.id}
                    className={cn(
                      subHeaderCls,
                      "p-3 text-left min-w-[220px] border-l align-top",
                      headerBorderCls
                    )}
                  >
                    <div className="font-bold text-xs uppercase tracking-wide">
                      {week.name}
                    </div>
                    <div className="text-primary-foreground/70 text-[11px] mt-0.5">
                      Week #{week.number}
                      {firstDate && (
                        <span className="ml-2">
                          {formatDate(firstDate)}
                          {lastDate && lastDate !== firstDate
                            ? ` – ${formatDate(lastDate)}`
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className="text-primary-foreground/50 text-[10px] mt-0.5">
                      {week.trainings.length} session
                      {week.trainings.length !== 1 ? "s" : ""}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {maxSessions === 0 ? (
              <tr>
                <td
                  colSpan={weeks.length + 1}
                  className="text-center text-sm text-muted-foreground p-6"
                >
                  No sessions added yet.
                </td>
              </tr>
            ) : (
              Array.from({ length: maxSessions }, (_, slotIdx) => (
                <tr
                  key={slotIdx}
                  className={cn(
                    "border-t border-border",
                    slotIdx % 2 === 1 ? "bg-muted/20" : "bg-background"
                  )}
                >
                  {/* Slot label */}
                  <td className="bg-muted sticky left-0 z-10 p-2 text-center align-top border-r border-border">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {slotIdx + 1}
                    </span>
                  </td>

                  {weeks.map((week) => {
                    const session: Training | undefined = week.trainings[slotIdx];
                    return (
                      <td
                        key={week.id}
                        className="p-3 align-top border-l border-border min-w-[220px] max-w-[280px]"
                      >
                        {session ? (
                          <SessionCell
                            session={session}
                            variant={variant}
                            onSessionClick={onSessionClick}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProgramGrid({ blocks, variant, onSessionClick }: ProgramGridProps) {
  if (blocks.length === 0) {
    return <p className="text-sm text-muted-foreground">No training blocks yet.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <BlockGrid
          key={block.id}
          block={block}
          variant={variant}
          onSessionClick={onSessionClick}
        />
      ))}
    </div>
  );
}
