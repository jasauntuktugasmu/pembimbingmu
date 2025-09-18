import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Edit, Trash2, ArrowLeft, Star, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import course thumbnails
import courseResearchTopic from '@/assets/course-research-topic.jpg';
import courseAcademicWriting from '@/assets/course-academic-writing.jpg';
import courseDataAnalysis from '@/assets/course-data-analysis.jpg';
import courseSpss from '@/assets/course-spss.jpg';

interface Course {
  id: string;
  judul: string;
  pengajar: string;
  deskripsi?: string;
  thumbnail_url?: string;
  rating: number;
  jumlah_review: number;
  durasi_menit: number;
  urutan: number;
  is_active: boolean;
  paket_id: string;
}

interface Package {
  id: string;
  nama_paket: string;
  deskripsi?: string;
  harga?: number;
  durasi_hari: number;
}

const CourseCard = ({ course, canEdit = false }: { course: Course; canEdit?: boolean }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleStartLearning = () => {
    navigate(`/lms/lesson/${course.id}`);
  };

  const handleEdit = () => {
    // TODO: Implement edit course modal
    toast({
      title: "Edit Course",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        const { error } = await supabase
          .from('kelas')
          .delete()
          .eq('id', course.id);

        if (error) throw error;

        toast({
          title: "Course Deleted",
          description: "Course has been deleted successfully",
        });
        
        // Refresh the page
        window.location.reload();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive"
        });
      }
    }
  };

  // Get appropriate thumbnail
  const getThumbnail = () => {
    if (course.thumbnail_url) return course.thumbnail_url;
    
    // Use default thumbnails based on course content
    if (course.judul.toLowerCase().includes('topik') || course.judul.toLowerCase().includes('penelitian')) {
      return courseResearchTopic;
    } else if (course.judul.toLowerCase().includes('judul') || course.judul.toLowerCase().includes('latar belakang')) {
      return courseAcademicWriting;
    } else if (course.judul.toLowerCase().includes('spss')) {
      return courseSpss;
    } else {
      return courseDataAnalysis;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} jam ${mins > 0 ? mins + ' menit' : ''}`;
    }
    return `${mins} menit`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={getThumbnail()} 
          alt={course.judul}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {canEdit && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
          {course.judul}
        </CardTitle>
        <p className="text-sm text-muted-foreground font-medium">
          {course.pengajar}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {course.deskripsi && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
            {course.deskripsi}
          </p>
        )}

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(course.rating)}
          </div>
          <span className="text-sm font-medium">{course.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({course.jumlah_review} reviews)
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatDuration(course.durasi_menit)}
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Button 
            onClick={handleStartLearning}
            className="w-full" 
            style={{ backgroundColor: '#81b59a' }}
          >
            <Play className="h-4 w-4 mr-2" />
            Mulai Belajar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LMSPackages() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === 'superadmin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('paket_pembelajaran')
        .select('*')
        .order('created_at');

      if (packagesError) throw packagesError;
      setPackages(packagesData || []);

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('kelas')
        .select('*')
        .eq('is_active', true)
        .order('urutan');

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByPackage = (packageId: string) => {
    return courses.filter(course => course.paket_id === packageId);
  };

  const getPackageByName = (name: string) => {
    return packages.find(pkg => pkg.nama_paket.toLowerCase().includes(name.toLowerCase()));
  };

  const handleAddCourse = (packageId: string) => {
    // TODO: Implement add course modal
    toast({
      title: "Add Course",
      description: "Add course functionality will be implemented soon",
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "LMS Packages - Pembimbingmu",
    "description": "Paket pembelajaran komprehensif untuk metodologi penelitian dan penulisan skripsi",
    "provider": {
      "@type": "Organization",
      "name": "Pembimbingmu"
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const basicPackage = getPackageByName('basic');
  const proPackage = getPackageByName('pro');
  const premiumPackage = getPackageByName('premium');

  return (
    <>
      <SEO 
        title="LMS Packages - Paket Pembelajaran | Pembimbingmu"
        description="Pilih paket pembelajaran yang sesuai kebutuhan Anda: Basic, Pro, atau Premium dengan materi lengkap metodologi penelitian dan analisis data."
        canonical="https://pembimbingmu.lovable.app/lms/packages"
        jsonLd={structuredData}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              LMS Packages
            </h1>
            <p className="text-muted-foreground">
              Pilih paket pembelajaran yang sesuai dengan kebutuhan Anda
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic" className="text-base">Basic</TabsTrigger>
            <TabsTrigger value="pro" className="text-base">Pro</TabsTrigger>
            <TabsTrigger value="premium" className="text-base">Premium</TabsTrigger>
          </TabsList>

          {/* Basic Package */}
          <TabsContent value="basic" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Basic</h2>
                <p className="text-muted-foreground">
                  {basicPackage?.deskripsi || 'Fondasi dasar untuk memulai penelitian dan skripsi Anda'}
                </p>
              </div>
              {isAdmin && (
                <Button 
                  className="bg-[#81b59a] hover:bg-[#6fa085]"
                  onClick={() => basicPackage && handleAddCourse(basicPackage.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {basicPackage && getCoursesByPackage(basicPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>

          {/* Pro Package */}
          <TabsContent value="pro" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Pro</h2>
                <p className="text-muted-foreground">
                  {proPackage?.deskripsi || 'Semua materi Basic + metodologi penelitian lanjutan'}
                </p>
              </div>
              {isAdmin && (
                <Button 
                  className="bg-[#81b59a] hover:bg-[#6fa085]"
                  onClick={() => proPackage && handleAddCourse(proPackage.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show Basic courses first */}
              {basicPackage && getCoursesByPackage(basicPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
              {/* Then Pro courses */}
              {proPackage && getCoursesByPackage(proPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>

          {/* Premium Package */}
          <TabsContent value="premium" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Premium</h2>
                <p className="text-muted-foreground">
                  {premiumPackage?.deskripsi || 'Paket lengkap dengan analisis data dan pembahasan mendalam'}
                </p>
              </div>
              {isAdmin && (
                <Button 
                  className="bg-[#81b59a] hover:bg-[#6fa085]"
                  onClick={() => premiumPackage && handleAddCourse(premiumPackage.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show Basic courses */}
              {basicPackage && getCoursesByPackage(basicPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
              {/* Show Pro courses */}
              {proPackage && getCoursesByPackage(proPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
              {/* Show Premium courses */}
              {premiumPackage && getCoursesByPackage(premiumPackage.id).map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}