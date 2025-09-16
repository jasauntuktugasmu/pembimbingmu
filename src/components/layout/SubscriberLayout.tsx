import { Outlet } from 'react-router-dom';
import { SubscriberSidebar } from './SubscriberSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const SubscriberLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SubscriberSidebar />
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};