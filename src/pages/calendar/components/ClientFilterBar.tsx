import { Client } from "@/api/client/client.types";
import { cn } from "@/lib/utils";
import { ClientColor } from "../hooks/useClientColors";

interface ClientFilterBarProps {
  clients: Client[];
  activeClientIds: Set<string>;
  getColor: (clientId: string) => ClientColor;
  onToggle: (clientId: string) => void;
}

export function ClientFilterBar({
  clients,
  activeClientIds,
  getColor,
  onToggle,
}: ClientFilterBarProps) {
  if (clients.length === 0) return null;

  const allActive = activeClientIds.size === 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium shrink-0">Clients:</span>
      <button
        onClick={() => {
          // Clear all filters (show everyone)
          clients.forEach((c) => {
            if (!allActive) onToggle(c.id);
          });
        }}
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
          allActive
            ? "bg-foreground text-background border-foreground"
            : "bg-muted text-muted-foreground border-transparent hover:border-border",
        )}
      >
        All
      </button>
      {clients.map((client) => {
        const color = getColor(client.id);
        const isActive = activeClientIds.has(client.id);
        const name = client.user?.name ?? client.user?.email ?? "Client";
        return (
          <button
            key={client.id}
            onClick={() => onToggle(client.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
              isActive
                ? `${color.chip} ${color.border}`
                : "bg-muted/50 text-muted-foreground border-transparent opacity-50 hover:opacity-80",
            )}
          >
            <span className={cn("w-2 h-2 rounded-full shrink-0", color.bg)} />
            {name}
          </button>
        );
      })}
    </div>
  );
}
