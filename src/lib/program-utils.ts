/** Maps a program assignment status string to a shadcn Badge variant. */
export function statusBadgeVariant(
  status: string
): "default" | "secondary" | "outline" {
  if (status === "active") return "default";
  if (status === "completed") return "secondary";
  return "outline";
}
