import { TrainingBlock, TrainingWeekSummary } from "@/api/training-block/training-block.types";
import { Training } from "@/api/training/training.types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { SessionCell } from "./SessionCell";

interface GridActions {
  onEditBlock: (block: TrainingBlock) => void;
  onDeleteBlock: (block: TrainingBlock) => void;
  onAddWeek: (blockId: number) => void;
  onEditWeek: (week: TrainingWeekSummary, blockId: number) => void;
  onDeleteWeek: (week: TrainingWeekSummary, blockId: number) => void;
  onDuplicateWeek: (week: TrainingWeekSummary, blockId: number) => void;
  onAddSession: (weekId: number) => void;
  onEditSession: (t: Training) => void;
  onDeleteSession: (t: Training) => void;
  onDuplicateSession: (t: Training) => void;
}

interface ProgramGridProps {
  blocks: TrainingBlock[];
  variant: "coach" | "client";
  onSessionClick: (training: Training) => void;
  actions?: GridActions;
  expandAll?: boolean;
}

function BlockGrid({
  block,
  variant,
  onSessionClick,
  actions,
  expandAll,
}: {
  block: TrainingBlock;
  variant: "coach" | "client";
  onSessionClick: (t: Training) => void;
  actions?: GridActions;
  expandAll?: boolean;
}) {
  const weeks: TrainingWeekSummary[] = block.weeks;
  const maxSessions = Math.max(...weeks.map((w) => w.trainings.length), 0);

  const headerCls = "bg-primary text-primary-foreground";
  const subHeaderCls = "bg-primary/90 text-primary-foreground";
  const headerBorderCls = "border-primary/30";
  const iconBtnCls =
    "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors p-1 rounded";

  if (weeks.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className={cn(headerCls, "px-4 py-3 flex items-center gap-3")}>
          <h3 className="font-bold text-sm uppercase tracking-wide flex-1">{block.name}</h3>
          {actions && (
            <div className="flex items-center gap-0.5">
              <button onClick={() => actions.onEditBlock(block)} className={iconBtnCls} title="Edit block">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => actions.onAddWeek(block.id)} className={iconBtnCls} title="Add week">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => actions.onDeleteBlock(block)} className={cn(iconBtnCls, "hover:text-red-300")} title="Delete block">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
        {actions && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => actions.onEditBlock(block)} className={iconBtnCls} title="Edit block">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => actions.onAddWeek(block.id)} className={iconBtnCls} title="Add week">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => actions.onDeleteBlock(block)} className={cn(iconBtnCls, "hover:text-red-300")} title="Delete block">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
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
                      </div>
                      {actions && (
                        <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                          <button
                            onClick={() => actions.onEditWeek(week, block.id)}
                            className={iconBtnCls}
                            title="Edit week"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => actions.onDuplicateWeek(week, block.id)}
                            className={iconBtnCls}
                            title="Duplicate week"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => actions.onDeleteWeek(week, block.id)}
                            className={cn(iconBtnCls, "hover:text-red-300")}
                            title="Delete week"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
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
                            onEditSession={actions?.onEditSession}
                            onDeleteSession={actions?.onDeleteSession}
                            onDuplicateSession={actions?.onDuplicateSession}
                            forceExpanded={expandAll ? true : undefined}
                          />
                        ) : (
                          actions ? (
                            <button
                              onClick={() => actions.onAddSession(week.id)}
                              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add session
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )
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

export function ProgramGrid({ blocks, variant, onSessionClick, actions, expandAll }: ProgramGridProps) {
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
          actions={actions}
          expandAll={expandAll}
        />
      ))}
    </div>
  );
}
