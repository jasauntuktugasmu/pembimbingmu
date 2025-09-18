import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PackageCategoryCard from '@/components/PackageCategoryCard';

// Interface definitions

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
  background_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  button_text?: string;
  category_link?: string;
  icon_url?: string;
  thumbnail_url?: string;
}

// Remove CourseCard component - replaced with category cards

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
      // Fetch packages with new fields
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

  const handleAddPackage = () => {
    toast({
      title: "Add Package",
      description: "Add package functionality will be implemented soon",
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Kategori Kelas - Pembimbingmu",
    "description": "Pilih kategori pembelajaran yang sesuai kebutuhan Anda dengan paket Basic, Pro, atau Premium",
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

  return (
    <>
      <SEO 
        title="Kategori Kelas - Paket Pembelajaran | Pembimbingmu"
        description="Pilih kategori pembelajaran yang sesuai kebutuhan Anda: Basic, Pro, atau Premium dengan materi lengkap metodologi penelitian dan analisis data."
        canonical="https://pembimbingmu.lovable.app/lms/packages"
        jsonLd={structuredData}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Kategori Kelas
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pilih kategori belajar yang paling sesuai dengan kebutuhan dan level pembelajaran Anda. 
              Setiap kategori dirancang untuk memberikan pengalaman belajar yang optimal.
            </p>
          </div>

          {/* Admin Add Package Button */}
          {isAdmin && (
            <div className="flex justify-center mb-8">
              <Button 
                onClick={handleAddPackage}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Package Baru
              </Button>
            </div>
          )}
        </div>

        {/* Package Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <PackageCategoryCard
              key={pkg.id}
              package={pkg}
              courseCount={getCoursesByPackage(pkg.id).length}
              onUpdate={fetchData}
            />
          ))}
        </div>

        {packages.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Belum ada kategori kelas tersedia
            </p>
            {isAdmin && (
              <Button onClick={handleAddPackage}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Package Pertama
              </Button>
            )}
          </div>
        )}
      </main>
    </>
  );
}