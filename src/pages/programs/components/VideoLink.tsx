import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface VideoLinkProps {
  href: string;
  className?: string;
}

export function VideoLink({ href, className }: VideoLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-blue-500 underline flex items-center gap-0.5 hover:text-blue-400",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="w-3 h-3 shrink-0" />
      Video
    </a>
  );
}
