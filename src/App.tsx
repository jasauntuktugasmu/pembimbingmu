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
import LMSPackages from "./pages/LMSPackages";
import DashboardHome from "./pages/DashboardHome";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { SubscriberLayout } from "./components/layout/SubscriberLayout";
import WriterLayout from "./components/layout/WriterLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageSubscribers } from "./pages/admin/ManageSubscribers";
import { ManagePackages } from "./pages/admin/ManagePackages";
import ManagePayments from "./pages/admin/ManagePayments";
import { SubscriberDashboard } from "./pages/subscriber/SubscriberDashboard";
import { MyPackages } from "./pages/subscriber/MyPackages";
import Learning from "./pages/subscriber/Learning";
import ClassList from "./pages/subscriber/ClassList";
import ClassDetail from "./pages/subscriber/ClassDetail";

// Blog admin
import AdminBlogArticles from "./pages/admin/blog/BlogArticles";
import AdminBlogArticleForm from "./pages/admin/blog/BlogArticleForm";
import AdminBlogCategories from "./pages/admin/blog/BlogCategories";
import AdminBlogTags from "./pages/admin/blog/BlogTags";
import ManageWriters from "./pages/admin/blog/ManageWriters";
import BlogAnalytics from "./pages/admin/blog/BlogAnalytics";

// Writer
import WriterDashboard from "./pages/writer/WriterDashboard";
import WriterArticles from "./pages/writer/WriterArticles";
import WriterArticleForm from "./pages/writer/WriterArticleForm";

// Public blog
import BlogList from "./pages/blog/BlogList";
import BlogDetail from "./pages/blog/BlogDetail";
import CategoryPage from "./pages/blog/CategoryPage";
import TagPage from "./pages/blog/TagPage";
import AuthorPage from "./pages/blog/AuthorPage";
import SearchPage from "./pages/blog/SearchPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Blog */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/cari" element={<SearchPage />} />
            <Route path="/blog/kategori/:slug" element={<CategoryPage />} />
            <Route path="/blog/tag/:slug" element={<TagPage />} />
            <Route path="/blog/penulis/:authorId" element={<AuthorPage />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="superadmin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="subscribers" element={<ManageSubscribers />} />
              <Route path="packages" element={<ManagePackages />} />
              <Route path="payments" element={<ManagePayments />} />
              <Route path="blog/articles" element={<AdminBlogArticles />} />
              <Route path="blog/articles/new" element={<AdminBlogArticleForm />} />
              <Route path="blog/articles/:id/edit" element={<AdminBlogArticleForm />} />
              <Route path="blog/categories" element={<AdminBlogCategories />} />
              <Route path="blog/tags" element={<AdminBlogTags />} />
              <Route path="blog/writers" element={<ManageWriters />} />
              <Route path="blog/analytics" element={<BlogAnalytics />} />
            </Route>

            {/* Writer Routes */}
            <Route path="/writer" element={
              <ProtectedRoute requireRole="writer">
                <WriterLayout />
              </ProtectedRoute>
            }>
              <Route index element={<WriterDashboard />} />
              <Route path="articles" element={<WriterArticles />} />
              <Route path="articles/new" element={<WriterArticleForm />} />
              <Route path="articles/:id/edit" element={<WriterArticleForm />} />
            </Route>
            
            {/* Subscriber Routes */}
            <Route path="/subscriber" element={
              <ProtectedRoute requireRole="subscriber">
                <SubscriberLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SubscriberDashboard />} />
              <Route path="my-packages" element={<MyPackages />} />
              <Route path="classes" element={<ClassList />} />
              <Route path="class/:classId" element={<ClassDetail />} />
              <Route path="learning/:classId" element={<Learning />} />
            </Route>

            {/* Legacy Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="cv" element={<CVAnalysis />} />
              <Route path="chatbotskripsi" element={<ChatbotSkripsi />} />
              <Route path="simulasi-sidang" element={<SimulasiSidang />} />
            </Route>
            <Route path="/dashboard/lms" element={<LMSDashboard />} />
            <Route path="/dashboard/lms/:moduleId" element={<LMSLesson />} />
            
            {/* LMS Package Routes - accessible by authenticated users */}
            <Route path="/lms/packages" element={
              <ProtectedRoute>
                <LMSPackages />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
