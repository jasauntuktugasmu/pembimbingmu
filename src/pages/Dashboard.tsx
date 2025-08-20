import React, { useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Mic, 
  FileText, 
  LogOut,
  User,
  Coins,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CreditDisplay } from '@/components/CreditDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import SEO from '@/components/SEO';

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Chatbot Konsultasi Skripsi", url: "/dashboard/chatbotskripsi", icon: MessageCircle },
  { title: "Analisa CV Terbaikmu", url: "/dashboard/cv", icon: FileText },
  { title: "LMS Skripsi", url: "/dashboard/lms", icon: FileText },
];

function AppSidebar({ onSignOut }: { onSignOut: () => void }) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-64"} bg-[#81b59a]`} collapsible="icon">
      <SidebarHeader className="p-6 bg-[#81b59a]">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
            alt="Pembimbingmu Logo" 
            className="h-10 w-auto"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Pembimbingmu</h1>
              <p className="text-xs text-gray-200">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#81b59a]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-white/20 text-white font-medium" 
                            : "text-gray-200 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
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
              onClick={onSignOut}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm">Keluar</span>}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Dashboard() {
  const location = useLocation()
  const { user, profile, loading, requireAuth, signOut } = useAuth()

  useEffect(() => {
    requireAuth()
  }, [requireAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81b59a] mx-auto"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to login
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.com/dashboard",
    "name": "Dashboard - Pembimbingmu",
    "description": "Dashboard pengguna Pembimbingmu - akses semua fitur bimbingan skripsi, analisis CV, dan konsultasi akademik",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.com"
    }
  };

  return (
    <>
      <SEO 
        title="Dashboard - Pembimbingmu | Platform Bimbingan Skripsi"
        description="Dashboard pengguna Pembimbingmu. Akses fitur bimbingan skripsi, analisis CV, chatbot konsultasi, dan LMS pembelajaran akademik."
        canonical={`https://pembimbingmu.com${location.pathname}`}
        jsonLd={structuredData}
      />
      <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar onSignOut={signOut} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between md:justify-end space-x-4">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center space-x-4">
                <CreditDisplay 
                  cvCredits={profile.cv_credits} 
                  skripsiCredits={profile.skripsi_credits} 
                />
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-[#81b59a] text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{profile.email}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-6 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <span>© 2025 Pembimbingmu. All Rights Reserved.</span>
                <div className="flex space-x-4">
                  <a href="#" className="hover:text-[#81b59a] transition-colors">
                    Syarat & Ketentuan
                  </a>
                  <a href="#" className="hover:text-[#81b59a] transition-colors">
                    Kebijakan Privasi
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
    </>
  );
}