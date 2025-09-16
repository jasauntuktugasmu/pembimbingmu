import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: string;
  nama_paket: string;
  durasi_hari: number;
}

interface AddSubscriberFormProps {
  onSuccess: () => void;
}

export const AddSubscriberForm: React.FC<AddSubscriberFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customDuration, setCustomDuration] = useState('');
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
    
    if (!email || !selectedPackage) {
      toast({
        title: 'Error',
        description: 'Email dan paket harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call the Edge Function to create subscriber
      const { data, error } = await supabase.functions.invoke('create-subscriber', {
        body: {
          email,
          paket_id: selectedPackage,
          custom_duration: customDuration
        }
      });

      if (error) {
        console.error('Error calling create-subscriber function:', error);
        toast({
          title: 'Error',
          description: 'Gagal menghubungi server: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data.error) {
        console.error('Error from create-subscriber function:', data.error);
        toast({
          title: 'Error',
          description: 'Gagal membuat subscriber: ' + data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Subscriber berhasil ditambahkan dengan password: ${data.password}`,
      });

      // Reset form
      setEmail('');
      setSelectedPackage('');
      setCustomDuration('');
      
      onSuccess();
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menambahkan subscriber',
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="subscriber@example.com"
          required
        />
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
        <Label htmlFor="duration">Durasi Custom (hari)</Label>
        <Input
          id="duration"
          type="number"
          value={customDuration}
          onChange={(e) => setCustomDuration(e.target.value)}
          placeholder="Kosongkan untuk menggunakan durasi default"
          min="1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Jika diisi, akan mengganti durasi default paket
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Tambah Subscriber'}
        </Button>
      </div>
    </form>
  );
};