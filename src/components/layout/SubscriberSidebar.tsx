import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/subscriber', icon: LayoutDashboard },
  { title: 'Paket Saya', url: '/subscriber/my-packages', icon: Package },
  { title: 'Pembelajaran', url: '/subscriber/learning', icon: BookOpen },
];

export const SubscriberSidebar = () => {
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} bg-[#81b59a]`} collapsible="icon">
      <SidebarHeader className="p-6 bg-[#81b59a]">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
            alt="Pembimbingmu Logo" 
            className="h-10 w-auto"
          />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Pembelajaran</h1>
              <p className="text-xs text-gray-200">{profile?.email}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#81b59a]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/subscriber'}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white font-medium" 
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-[#81b59a]">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};