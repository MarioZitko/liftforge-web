import * as React from "react";

import { NavContent } from "@/components/sidebar/NavContent";
import { NavUser } from "@/components/sidebar/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar/Sidebar";

const data = {
  navMain: [
    // {
    //   title: 'Showcase',
    //   url: navigator.general.showcase(),
    //   icon: IconPalette,
    // },
    // {
    //   title: 'Samples',
    //   url: navigator.modules.laboratorySamples(),
    //   icon: IconTestPipe,
    // },
    // {
    //   title: 'Work Orders',
    //   url: navigator.modules.workOrders(),
    //   icon: IconClipboardText,
    // },
    // {
    //   title: 'Test Reports',
    //   url: '#',
    //   icon: IconFileDescription,
    // },
  ],
  navSecondary: [
    // {
    //   title: 'Users',
    //   url: navigator.administration.users(),
    //   icon: IconSettings,
    // },
    // {
    //   title: 'Codebooks',
    //   url: navigator.codebooks.laboratorySampleSuffixes(),
    //   icon: IconNumber,
    // },
    // {
    //   title: 'Tests',
    //   url: '/tests',
    //   icon: IconChartBar,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavContent title="Main menu" items={data.navMain} />
        <NavContent title="Administration" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
