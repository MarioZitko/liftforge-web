import { cn } from "@/lib/utils";
import { SidebarInset } from "../sidebar/Sidebar";
import { SiteHeader } from "./SiteHeader";
import { IPageProps } from "./types";

export function Page({ className, title, children, ...props }: IPageProps) {
  return (
    <SidebarInset>
      <SiteHeader title={title} />
      <main className={cn("flex-1 p-6 overflow-auto", className)} {...props}>
        {children}
      </main>
    </SidebarInset>
  );
}
