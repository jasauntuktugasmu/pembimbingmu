import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { CourseCard } from '@/components/CourseCard';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Package {
  id: string;
  nama_paket: string;
  deskripsi?: string;
  harga?: number;
  durasi_hari: number;
  thumbnail_url?: string;
  button_text?: string;
  courseCount?: number;
}

export default function HomePage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('paket_pembelajaran')
        .select('*')
        .order('created_at', { ascending: true });

      if (packagesError) {
        throw packagesError;
      }

      // Fetch course counts for each package
      const packagesWithCounts = await Promise.all(
        (packagesData || []).map(async (pkg) => {
          const { count } = await supabase
            .from('kelas')
            .select('*', { count: 'exact' })
            .eq('paket_id', pkg.id)
            .eq('is_active', true);

          return {
            ...pkg,
            courseCount: count || 0
          };
        })
      );

      setPackages(packagesWithCounts);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Gagal memuat data paket pembelajaran');
      toast({
        title: "Error",
        description: "Gagal memuat data paket pembelajaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (days: number) => {
    if (days < 30) {
      return `${days} hari`;
    } else {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) {
        return `${months} bulan`;
      }
      return `${months} bulan ${remainingDays} hari`;
    }
  };

  const generateMockRating = (packageId: string) => {
    // Generate consistent rating based on package ID
    const hash = packageId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 4.0 + (Math.abs(hash) % 100) / 100; // Rating between 4.0 - 5.0
  };

  const generateMockReviewCount = (packageId: string) => {
    // Generate consistent review count based on package ID
    const hash = packageId.split('').reduce((a, b) => {
      a = ((a << 7) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 50 + (Math.abs(hash) % 500); // Review count between 50-550
  };

  const generateMockStudentCount = (packageId: string) => {
    // Generate consistent student count based on package ID
    const hash = packageId.split('').reduce((a, b) => {
      a = ((a << 3) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 100 + (Math.abs(hash) % 2000); // Student count between 100-2100
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="Error - Pembimbingmu"
          description="Terjadi kesalahan dalam memuat halaman"
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Paket Pembelajaran - Pembimbingmu"
        description="Pilih paket pembelajaran terbaik untuk mengembangkan skill Anda bersama Pembimbingmu"
      />
      
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Paket Pembelajaran Terpopuler
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pilih Kelas yang paling Banyak diminati
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Belum ada paket pembelajaran tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <CourseCard
                key={pkg.id}
                id={pkg.id}
                title={pkg.nama_paket}
                description={pkg.deskripsi}
                thumbnail={pkg.thumbnail_url}
                rating={generateMockRating(pkg.id)}
                reviewCount={generateMockReviewCount(pkg.id)}
                studentCount={generateMockStudentCount(pkg.id)}
                duration={formatDuration(pkg.durasi_hari)}
                currentPrice={pkg.harga}
                level="All Levels"
                buttonText={pkg.button_text || "Daftar Kelas"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}