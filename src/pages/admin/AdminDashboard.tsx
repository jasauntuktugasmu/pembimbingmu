import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalPackages: number;
  expiringSoon: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalPackages: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total subscribers
      const { count: totalSubscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });

      // Fetch active subscribers
      const { count: activeSubscribers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('durasi_akhir', new Date().toISOString());

      // Fetch total packages
      const { count: totalPackages } = await supabase
        .from('paket_pembelajaran')
        .select('*', { count: 'exact', head: true });

      // Fetch expiring soon (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const { count: expiringSoon } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('durasi_akhir', sevenDaysFromNow.toISOString())
        .gt('durasi_akhir', new Date().toISOString());

      setStats({
        totalSubscribers: totalSubscribers || 0,
        activeSubscribers: activeSubscribers || 0,
        totalPackages: totalPackages || 0,
        expiringSoon: expiringSoon || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Subscribers',
      value: stats.totalSubscribers,
      icon: Users,
      description: 'Semua subscriber terdaftar',
    },
    {
      title: 'Active Subscribers', 
      value: stats.activeSubscribers,
      icon: Activity,
      description: 'Subscriber dengan status aktif',
    },
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      icon: Package,
      description: 'Paket pembelajaran tersedia',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: Calendar,
      description: 'Akan berakhir dalam 7 hari',
    },
  ];

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
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola subscribers dan paket pembelajaran
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => window.location.href = '/admin/subscribers'}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Manage Subscribers</div>
                <div className="text-sm text-muted-foreground">
                  Tambah, edit, atau hapus subscriber
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/admin/packages'}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="font-medium">Manage Packages</div>
                <div className="text-sm text-muted-foreground">
                  Kelola paket pembelajaran dan konten
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity log akan ditampilkan di sini...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};