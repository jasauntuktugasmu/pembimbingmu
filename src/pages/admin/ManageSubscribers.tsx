import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddSubscriberForm } from '@/components/admin/AddSubscriberForm';
import { EditSubscriberForm } from '@/components/admin/EditSubscriberForm';

interface Subscriber {
  id: string;
  status: string;
  durasi_mulai: string;
  durasi_akhir: string;
  created_at: string;
  profiles: {
    id: string;
    email: string;
  };
  paket_pembelajaran: {
    id: string;
    nama_paket: string;
  };
}

export const ManageSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select(`
          *,
          profiles (
            id,
            email
          ),
          paket_pembelajaran (
            id,
            nama_paket
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscribers:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data subscribers',
          variant: 'destructive',
        });
        return;
      }

      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus subscriber ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) {
        console.error('Error deleting subscriber:', error);
        toast({
          title: 'Error',
          description: 'Gagal menghapus subscriber',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Subscriber berhasil dihapus',
      });

      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
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

  const filteredSubscribers = subscribers.filter(subscriber =>
    (subscriber.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (subscriber.paket_pembelajaran?.nama_paket?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Subscribers</h1>
          <p className="text-muted-foreground">
            Kelola subscribers dan paket mereka
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Subscriber Baru</DialogTitle>
            </DialogHeader>
            <AddSubscriberForm 
              onSuccess={() => {
                setShowAddDialog(false);
                fetchSubscribers();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan email atau paket..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          Total: {subscribers.length} subscribers
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscribers.map((subscriber) => (
          <Card key={subscriber.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {subscriber.profiles?.email || 'No email'}
                </CardTitle>
                {getStatusBadge(subscriber.status, subscriber.durasi_akhir)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{subscriber.paket_pembelajaran?.nama_paket || 'No package'}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Mulai: {format(new Date(subscriber.durasi_mulai), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Berakhir: {format(new Date(subscriber.durasi_akhir), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSubscriber(subscriber)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscribers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Tidak ada hasil' : 'Belum ada subscribers'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? 'Tidak ada subscribers yang sesuai dengan pencarian Anda.'
                : 'Tambahkan subscriber baru untuk memulai.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingSubscriber} 
        onOpenChange={(open) => !open && setEditingSubscriber(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
          </DialogHeader>
          {editingSubscriber && (
            <EditSubscriberForm 
              subscriber={editingSubscriber}
              onSuccess={() => {
                setEditingSubscriber(null);
                fetchSubscribers();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};