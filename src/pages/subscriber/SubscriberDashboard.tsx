import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MySubscription {
  id: string;
  status: string;
  durasi_mulai: string;
  durasi_akhir: string;
  paket_pembelajaran: {
    id: string;
    nama_paket: string;
    deskripsi: string;
    durasi_hari: number;
  } | null;
}

export const SubscriberDashboard = () => {
  const { user } = useAuth();
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
            durasi_hari
          )
        `)
        .eq('user_id', user?.id)
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

  const getStatusBadge = (status: string, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (status === 'active' && end > now) {
      return <Badge className="bg-green-500">Aktif</Badge>;
    } else if (end <= now) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
        <h1 className="text-3xl font-bold text-foreground">Dashboard Pembelajaran</h1>
        <p className="text-muted-foreground">
          Kelola paket pembelajaran Anda dan akses materi
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Paket</h3>
            <p className="text-muted-foreground text-center mb-4">
              Anda belum memiliki paket pembelajaran yang aktif.
            </p>
            <p className="text-sm text-muted-foreground">
              Hubungi admin untuk mendapatkan akses paket pembelajaran.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            // Handle null paket_pembelajaran
            if (!subscription.paket_pembelajaran) {
              return (
                <Card key={subscription.id} className="hover:shadow-md transition-shadow border-destructive/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-destructive">
                        Paket Tidak Ditemukan
                      </CardTitle>
                      <Badge variant="destructive">Error</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Data paket pembelajaran tidak dapat ditemukan. Hubungi admin untuk bantuan.
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {subscription.paket_pembelajaran.nama_paket}
                    </CardTitle>
                    {getStatusBadge(subscription.status, subscription.durasi_akhir)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {subscription.paket_pembelajaran.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Mulai: {format(new Date(subscription.durasi_mulai), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Berakhir: {format(new Date(subscription.durasi_akhir), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  {subscription.status === 'active' && new Date(subscription.durasi_akhir) > new Date() && (
                    <div className="flex items-center text-sm">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        Sisa: {getDaysRemaining(subscription.durasi_akhir)} hari
                      </span>
                    </div>
                  )}
                </div>

                {subscription.status === 'active' && new Date(subscription.durasi_akhir) > new Date() && (
                  <div className="mt-4">
                    <button 
                      onClick={() => window.location.href = '/subscriber/learning'}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors"
                    >
                      Mulai Belajar
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => window.location.href = '/subscriber/my-packages'}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Paket Saya</div>
                <div className="text-sm text-muted-foreground">
                  Lihat detail paket yang Anda miliki
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/subscriber/learning'}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Pembelajaran</div>
                <div className="text-sm text-muted-foreground">
                  Akses materi pembelajaran
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Akses materi pembelajaran sesuai dengan paket yang Anda miliki</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Pastikan untuk menyelesaikan pembelajaran sebelum masa berlaku habis</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Hubungi admin jika mengalami kesulitan atau membutuhkan bantuan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};