import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Clock, BookOpen, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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

  const isPackageActive = (status: string, endDate: string) => {
    return status === 'active' && new Date(endDate) > new Date();
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
          Detail paket pembelajaran yang Anda miliki
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
        <div className="space-y-6">
          {subscriptions.map((subscription) => {
            // Handle null paket_pembelajaran
            if (!subscription.paket_pembelajaran) {
              return (
                <Card key={subscription.id} className="hover:shadow-md transition-shadow border-destructive/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-destructive">
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
                    <CardTitle className="text-xl">
                      {subscription.paket_pembelajaran.nama_paket}
                    </CardTitle>
                    {getStatusBadge(subscription.status, subscription.durasi_akhir)}
                  </div>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Package Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Deskripsi Paket</h4>
                      <p className="text-muted-foreground">
                        {subscription.paket_pembelajaran.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Harga</p>
                          <p className="font-medium">
                            Rp {subscription.paket_pembelajaran.harga?.toLocaleString('id-ID') || '0'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Durasi Paket</p>
                          <p className="font-medium">
                            {subscription.paket_pembelajaran.durasi_hari} hari
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Status Subscription</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
                            <p className="font-medium">
                              {format(new Date(subscription.durasi_mulai), 'dd MMMM yyyy', { locale: id })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Tanggal Berakhir</p>
                            <p className="font-medium">
                              {format(new Date(subscription.durasi_akhir), 'dd MMMM yyyy', { locale: id })}
                            </p>
                          </div>
                        </div>

                        {isPackageActive(subscription.status, subscription.durasi_akhir) && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Sisa Waktu</p>
                              <p className="font-medium text-primary">
                                {getDaysRemaining(subscription.durasi_akhir)} hari lagi
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isPackageActive(subscription.status, subscription.durasi_akhir) && (
                      <div className="pt-4">
                        <Button 
                          onClick={() => navigate('/subscriber/learning')}
                          className="w-full"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Akses Pembelajaran
                        </Button>
                      </div>
                    )}

                    {/* Expired Notice */}
                    {!isPackageActive(subscription.status, subscription.durasi_akhir) && (
                      <div className="pt-4">
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-sm text-destructive">
                            Paket ini sudah tidak aktif. Hubungi admin untuk perpanjangan.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};