import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CVAnalysis from "./pages/CVAnalysis";
import ChatbotSkripsi from "./pages/ChatbotSkripsi";
import SimulasiSidang from "./pages/SimulasiSidang";
import NotFound from "./pages/NotFound";
import LMSDashboard from "./pages/LMSDashboard";
import LMSLesson from "./pages/LMSLesson";
import DashboardHome from "./pages/DashboardHome";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="cv" element={<CVAnalysis />} />
            <Route path="chatbotskripsi" element={<ChatbotSkripsi />} />
            <Route path="simulasi-sidang" element={<SimulasiSidang />} />
          </Route>
          <Route path="/dashboard/lms" element={<LMSDashboard />} />
          <Route path="/dashboard/lms/:moduleId" element={<LMSLesson />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
