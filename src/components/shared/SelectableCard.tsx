import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectableCardVariants = cva(
  "text-left transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        row: "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50",
        card: "p-3 rounded-lg border",
        pill: "px-3 py-1.5 rounded-full text-sm border",
        circle: "flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold border",
      },
      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "card", selected: false, className: "border-border hover:bg-muted" },
      { variant: "card", selected: true, className: "border-primary bg-primary/5" },
      { variant: "pill", selected: false, className: "border-border hover:bg-muted" },
      {
        variant: "pill",
        selected: true,
        className: "bg-primary text-primary-foreground border-primary",
      },
      {
        variant: "circle",
        selected: false,
        className: "border-border text-muted-foreground hover:bg-muted",
      },
      {
        variant: "circle",
        selected: true,
        className: "bg-primary text-primary-foreground border-primary",
      },
    ],
    defaultVariants: {
      variant: "row",
      selected: false,
    },
  }
);

interface SelectableCardProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof selectableCardVariants> {}

export function SelectableCard({ variant, selected, className, ...props }: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected ?? undefined}
      className={cn(selectableCardVariants({ variant, selected, className }))}
      {...props}
    />
  );
}
