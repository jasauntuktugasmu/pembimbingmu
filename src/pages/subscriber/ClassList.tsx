import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

interface Class {
  id: string;
  paket_id: string;
  judul: string;
  deskripsi?: string;
  thumbnail_url?: string;
  rating: number;
  jumlah_review: number;
  durasi_menit: number;
  durasi_text?: string;
  pengajar: string;
  level: string;
  jumlah_user: number;
  harga_asli?: number;
  harga_diskon?: number;
  urutan: number;
  is_active: boolean;
}

interface UserPackage {
  id: string;
  paket_id: string;
  nama_paket: string;
  status: string;
  durasi_akhir: string;
}

export default function ClassList() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'subscriber') {
      navigate('/dashboard');
      return;
    }
    fetchUserPackagesAndClasses();
  }, [profile, navigate]);

  const fetchUserPackagesAndClasses = async () => {
    try {
      setLoading(true);

      // Fetch user's active packages
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select(`
          id,
          paket_id,
          status,
          durasi_akhir,
          paket_pembelajaran!inner(nama_paket)
        `)
        .eq('user_id', profile?.id)
        .eq('status', 'active')
        .gt('durasi_akhir', new Date().toISOString());

      if (subscriberError) throw subscriberError;

      const packages = subscriberData?.map(sub => ({
        id: sub.id,
        paket_id: sub.paket_id,
        nama_paket: (sub.paket_pembelajaran as any)?.nama_paket || '',
        status: sub.status,
        durasi_akhir: sub.durasi_akhir
      })) || [];

      setUserPackages(packages);

      if (packages.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      // Fetch classes from user's active packages
      const packageIds = packages.map(pkg => pkg.paket_id);
      const { data: classesData, error: classesError } = await supabase
        .from('kelas')
        .select('*')
        .in('paket_id', packageIds)
        .eq('is_active', true)
        .order('urutan');

      if (classesError) throw classesError;
      setClasses(classesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const handleContinueClass = (classId: string) => {
    // Navigate to class detail/video page
    navigate(`/subscriber/class/${classId}`);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Daftar Kelas - Pembelajaran Aktif",
    "description": "Akses semua kelas dari paket pembelajaran yang Anda miliki",
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
        title="Daftar Kelas - Pembelajaran Aktif | Pembimbingmu"
        description="Akses semua kelas dari paket pembelajaran yang Anda miliki. Mulai belajar dengan materi berkualitas dari mentor berpengalaman."
        canonical="https://pembimbingmu.lovable.app/subscriber/classes"
        jsonLd={structuredData}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/subscriber/dashboard')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Daftar Kelas
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Akses semua kelas dari paket pembelajaran yang Anda miliki. 
              Mulai perjalanan belajar Anda dengan materi berkualitas.
            </p>
          </div>
        </div>

        {/* Content */}
        {userPackages.length === 0 ? (
          // No Active Packages Placeholder
          <div className="max-w-md mx-auto">
            <Card className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Belum Ada Paket Aktif
                </h3>
                <p className="text-gray-500">
                  Anda belum memiliki paket pembelajaran aktif. 
                  Hubungi admin untuk mengaktifkan paket Anda.
                </p>
                <Button 
                  onClick={() => navigate('/lms/packages')}
                  className="bg-[#81b59a] hover:bg-[#6da085] text-white"
                >
                  Lihat Paket Tersedia
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : classes.length === 0 ? (
          // No Classes in Active Packages
          <div className="max-w-md mx-auto">
            <Card className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Belum Ada Kelas
                </h3>
                <p className="text-gray-500">
                  Kelas untuk paket Anda sedang dalam persiapan. 
                  Silakan cek kembali nanti.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Classes Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl border-0">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="w-48 h-36 bg-muted flex-shrink-0 relative">
                      {classItem.thumbnail_url ? (
                        <img
                          src={classItem.thumbnail_url}
                          alt={classItem.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <div className="text-center">
                            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500 font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Class Info */}
                    <div className="flex-1 p-5">
                      <div className="space-y-3">
                        {/* Level Badge */}
                        <Badge className={`${getLevelColor(classItem.level)} font-medium text-xs px-3 py-1`}>
                          {classItem.level}
                        </Badge>

                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                          {classItem.judul}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(classItem.rating)}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {classItem.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({classItem.jumlah_review})
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{classItem.jumlah_user}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {classItem.durasi_text || `${classItem.durasi_menit}m`}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        {(classItem.harga_asli || classItem.harga_diskon) && (
                          <div className="flex items-center gap-3">
                            {classItem.harga_asli && (
                              <span className="text-sm text-gray-400 line-through font-medium">
                                Rp{classItem.harga_asli.toLocaleString('id-ID')}
                              </span>
                            )}
                            {classItem.harga_diskon && (
                              <span className="text-lg font-bold text-orange-600">
                                Rp{classItem.harga_diskon.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Continue Button */}
                        <div className="pt-2">
                          <Button
                            onClick={() => handleContinueClass(classItem.id)}
                            className="w-full bg-[#81b59a] hover:bg-[#6da085] text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            Lanjutkan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Packages Info */}
        {userPackages.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Paket Aktif Anda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPackages.map((pkg) => (
                <Card key={pkg.id} className="bg-gradient-to-r from-[#81b59a] to-[#6da085] text-white border-0">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-lg mb-2">{pkg.nama_paket}</h3>
                    <p className="text-sm opacity-90">
                      Berlaku hingga: {new Date(pkg.durasi_akhir).toLocaleDateString('id-ID')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}