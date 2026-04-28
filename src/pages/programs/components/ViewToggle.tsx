import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        className="rounded-none gap-1 h-8 px-3"
        onClick={() => onViewChange("list")}
      >
        <List className="w-3.5 h-3.5" />
        List
      </Button>
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        className="rounded-none gap-1 h-8 px-3"
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Grid
      </Button>
    </div>
  );
}
