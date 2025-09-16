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
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">Pembelajaran</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/subscriber'}
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};