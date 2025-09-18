import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MySubscription {
  id: string;
  status: string;
  durasi_mulai: string;
  durasi_akhir: string;
  paket_pembelajaran: {
    id: string;
    nama_paket: string;
    deskripsi: string;
    harga: number;
    durasi_hari: number;
    thumbnail_url: string | null;
  } | null;
}

export const MyPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<MySubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMySubscriptions();
    }
  }, [user]);

  const fetchMySubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select(`
          *,
          paket_pembelajaran (
            id,
            nama_paket,
            deskripsi,
            harga,
            durasi_hari,
            thumbnail_url
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gte('durasi_akhir', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClasses = (packageId: string) => {
    navigate(`/subscriber/learning?package=${packageId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paket Saya</h1>
        <p className="text-muted-foreground">
          Paket pembelajaran yang Anda miliki
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer bg-gradient-to-br from-gray-400 to-gray-600 h-80">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="relative h-full flex flex-col justify-between p-6">
              <div className="flex justify-center items-center flex-1">
                <Package className="h-16 w-16 text-white/60" />
              </div>
              
              <div className="space-y-3">
                <div className="inline-block">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                    Status
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Belum ada paket aktif
                </h3>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            if (!subscription.paket_pembelajaran) {
              return null;
            }

            const paket = subscription.paket_pembelajaran;
            const backgroundImage = paket.thumbnail_url 
              ? `url(${paket.thumbnail_url})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

            return (
              <div
                key={subscription.id}
                className="relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer h-80 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{
                  backgroundImage: backgroundImage,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                <div className="relative h-full flex flex-col justify-between p-6">
                  {/* Center Button */}
                  <div className="flex justify-center items-center flex-1">
                    <Button
                      onClick={() => handleViewClasses(paket.id)}
                      variant="outline"
                      className="bg-white/20 border-2 border-white/80 text-white font-bold px-10 py-4 rounded-xl hover:bg-[#81b59a] hover:border-[#81b59a] hover:shadow-lg hover:shadow-[#81b59a]/30 active:bg-[#a8d3c0] active:border-[#a8d3c0] active:shadow-lg active:shadow-[#a8d3c0]/30 transition-all duration-300 backdrop-blur-md text-sm uppercase tracking-wide shadow-lg"
                    >
                      Lihat Kelas
                    </Button>
                  </div>
                  
                  {/* Bottom Content */}
                  <div className="space-y-3">
                    <div className="inline-block">
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                        Kategori
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {paket.nama_paket}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};