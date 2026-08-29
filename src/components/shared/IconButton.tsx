import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconButtonVariants = cva("rounded transition-colors", {
  variants: {
    tone: {
      header:
        "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10",
      muted: "text-muted-foreground hover:text-foreground",
    },
    size: {
      sm: "p-1",
      xs: "p-0.5",
    },
    destructive: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { tone: "header", destructive: true, className: "hover:text-red-300" },
    { tone: "muted", destructive: true, className: "hover:text-red-400" },
  ],
  defaultVariants: {
    tone: "muted",
    size: "xs",
    destructive: false,
  },
})

function IconButton({
  className,
  tone,
  size,
  destructive,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
  return (
    <button
      className={cn(iconButtonVariants({ tone, size, destructive, className }))}
      {...props}
    />
  )
}

export { IconButton, iconButtonVariants }
