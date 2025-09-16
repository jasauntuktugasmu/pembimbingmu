import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Package {
  id: string;
  nama_paket: string;
  durasi_hari: number;
}

interface Subscriber {
  id: string;
  status: string;
  durasi_mulai: string;
  durasi_akhir: string;
  profiles: {
    email: string;
  };
  paket_pembelajaran: {
    id: string;
    nama_paket: string;
  };
}

interface EditSubscriberFormProps {
  subscriber: Subscriber;
  onSuccess: () => void;
}

export const EditSubscriberForm: React.FC<EditSubscriberFormProps> = ({ 
  subscriber, 
  onSuccess 
}) => {
  const [selectedPackage, setSelectedPackage] = useState(subscriber.paket_pembelajaran.id);
  const [status, setStatus] = useState(subscriber.status);
  const [endDate, setEndDate] = useState(format(new Date(subscriber.durasi_akhir), 'yyyy-MM-dd'));
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('paket_pembelajaran')
        .select('id, nama_paket, durasi_hari')
        .order('nama_paket');

      if (error) {
        console.error('Error fetching packages:', error);
        return;
      }

      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPackage || !status || !endDate) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          paket_id: selectedPackage,
          status,
          durasi_akhir: new Date(endDate).toISOString(),
        })
        .eq('id', subscriber.id);

      if (error) {
        console.error('Error updating subscriber:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengupdate subscriber: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Subscriber berhasil diupdate',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengupdate subscriber',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPackages) {
    return <div>Loading packages...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Email</Label>
        <Input
          value={subscriber.profiles.email}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Email tidak dapat diubah
        </p>
      </div>

      <div>
        <Label htmlFor="package">Paket Pembelajaran</Label>
        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih paket..." />
          </SelectTrigger>
          <SelectContent>
            {packages.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.nama_paket} ({pkg.durasi_hari} hari)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="endDate">Tanggal Berakhir</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Update Subscriber'}
        </Button>
      </div>
    </form>
  );
};