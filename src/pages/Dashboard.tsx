import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Mic, 
  FileText, 
  LogOut,
  User,
  Coins
} from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Chatbot Konsultasi Skripsi", url: "/dashboard/chatbot", icon: MessageCircle },
  { title: "Simulasi Sidang", url: "/dashboard/simulasi", icon: Mic },
  { title: "Analisa CV Terbaikmu", url: "/dashboard/cv", icon: FileText },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
            alt="Pembimbingmu Logo" 
            className="h-10 w-auto"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Pembimbingmu</h1>
              <p className="text-xs text-gray-300">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
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
                            ? "bg-[#81b59a] text-white font-medium" 
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
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

      <SidebarFooter className="p-4">
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink 
              to="/" 
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm">Keluar</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Dashboard() {
  const productCards = [
    {
      title: "Chatbot Konsultasi Skripsi",
      description: "Dapatkan jawaban dan bimbingan instan untuk skripsi Anda kapan saja.",
      buttonText: "Mulai Konsultasi",
      icon: MessageCircle,
      href: "/dashboard/chatbot"
    },
    {
      title: "Simulasi Sidang Voicebot",
      description: "Latih mental dan jawaban Anda dengan simulasi sidang yang realistis.",
      buttonText: "Coba Simulasi",
      icon: Mic,
      href: "/dashboard/simulasi"
    },
    {
      title: "Analisa CV Profesional",
      description: "Upload CV Anda dan dapatkan skor serta masukan untuk perbaikan.",
      buttonText: "Analisa Sekarang",
      icon: FileText,
      href: "/dashboard/cv"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Coins className="h-4 w-4 text-[#81b59a]" />
                <span>Sisa Kredit: 100</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-[#81b59a] text-white">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">Nama Pengguna</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Selamat Datang, Nama Pengguna!
                </h1>
                <h2 className="text-xl text-gray-600 font-medium">
                  Siap Memulai?
                </h2>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {productCards.map((product, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-[#81b59a] rounded-lg">
                          <product.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white font-medium"
                        onClick={() => window.location.href = product.href}
                      >
                        {product.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
  );
}