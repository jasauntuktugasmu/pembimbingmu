import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, ArrowLeft, Play } from 'lucide-react';
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

export default function ClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'subscriber') {
      navigate('/dashboard');
      return;
    }
    fetchClassData();
  }, [classId, profile, navigate]);

  const fetchClassData = async () => {
    if (!classId) {
      navigate('/subscriber/classes');
      return;
    }

    try {
      setLoading(true);

      // Fetch class data
      const { data: classData, error: classError } = await supabase
        .from('kelas')
        .select('*')
        .eq('id', classId)
        .eq('is_active', true)
        .single();

      if (classError) throw classError;

      setClassData(classData);

      // Check if user has access to this class through their active packages
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('paket_id')
        .eq('user_id', profile?.id)
        .eq('paket_id', classData.paket_id)
        .eq('status', 'active')
        .gt('durasi_akhir', new Date().toISOString())
        .single();

      if (subscriberError && subscriberError.code !== 'PGRST116') {
        throw subscriberError;
      }

      setHasAccess(!!subscriberData);

      if (!subscriberData) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki akses ke kelas ini",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive"
      });
      navigate('/subscriber/classes');
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
        className={`h-5 w-5 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleStartLearning = () => {
    // Here you would navigate to the actual video/content page
    toast({
      title: "Memulai Pembelajaran",
      description: "Fitur video pembelajaran akan segera tersedia",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData || !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Kelas Tidak Ditemukan
              </h3>
              <p className="text-gray-500">
                Kelas yang Anda cari tidak ditemukan atau Anda tidak memiliki akses ke kelas ini.
              </p>
              <Button 
                onClick={() => navigate('/subscriber/classes')}
                className="bg-[#81b59a] hover:bg-[#6da085] text-white"
              >
                Kembali ke Daftar Kelas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": classData.judul,
    "description": classData.deskripsi,
    "instructor": {
      "@type": "Person",
      "name": classData.pengajar
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": classData.rating,
      "reviewCount": classData.jumlah_review
    }
  };

  return (
    <>
      <SEO 
        title={`${classData.judul} | Pembimbingmu`}
        description={classData.deskripsi || `Pelajari ${classData.judul} dengan ${classData.pengajar}`}
        canonical={`https://pembimbingmu.lovable.app/subscriber/class/${classData.id}`}
        jsonLd={structuredData}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/subscriber/classes')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Kelas
          </Button>
        </div>

        {/* Class Detail */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden rounded-2xl shadow-xl">
            {/* Header Image */}
            <div className="relative h-64 bg-gradient-to-r from-[#81b59a] to-[#6da085]">
              {classData.thumbnail_url ? (
                <img
                  src={classData.thumbnail_url}
                  alt={classData.judul}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-16 w-16 text-white/80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Level and Title */}
                <div>
                  <Badge className={`${getLevelColor(classData.level)} font-medium mb-4`}>
                    {classData.level}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {classData.judul}
                  </h1>
                  <p className="text-lg text-gray-600">
                    oleh <span className="font-semibold">{classData.pengajar}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 py-4 border-y border-gray-200">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(classData.rating)}
                    </div>
                    <span className="font-semibold text-gray-700">
                      {classData.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({classData.jumlah_review} reviews)
                    </span>
                  </div>

                  {/* Students */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{classData.jumlah_user} siswa</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">
                      {classData.durasi_text || `${classData.durasi_menit} menit`}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {classData.deskripsi && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      Tentang Kelas Ini
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {classData.deskripsi}
                    </p>
                  </div>
                )}

                {/* Pricing */}
                {(classData.harga_asli || classData.harga_diskon) && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      Harga
                    </h2>
                    <div className="flex items-center gap-3">
                      {classData.harga_asli && (
                        <span className="text-lg text-gray-400 line-through">
                          Rp{classData.harga_asli.toLocaleString('id-ID')}
                        </span>
                      )}
                      {classData.harga_diskon && (
                        <span className="text-2xl font-bold text-orange-600">
                          Rp{classData.harga_diskon.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Start Learning Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleStartLearning}
                    className="w-full bg-[#81b59a] hover:bg-[#6da085] text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Mulai Belajar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}