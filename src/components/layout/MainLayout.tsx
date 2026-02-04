import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { SidebarProvider } from '@/components/sidebar/Sidebar';

export default function MainLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
