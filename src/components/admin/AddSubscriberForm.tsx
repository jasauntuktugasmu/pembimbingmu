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
      // First, create user account
      const password = Math.random().toString(36).slice(-8); // Generate random password
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating user:', authError);
        toast({
          title: 'Error',
          description: 'Gagal membuat akun user: ' + authError.message,
          variant: 'destructive',
        });
        return;
      }

      // Get package duration
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      const durationDays = customDuration ? parseInt(customDuration) : selectedPkg?.durasi_hari || 30;

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durationDays);

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('subscribers')
        .insert({
          user_id: authData.user.id,
          paket_id: selectedPackage,
          durasi_mulai: startDate.toISOString(),
          durasi_akhir: endDate.toISOString(),
          status: 'active'
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        toast({
          title: 'Error',
          description: 'Gagal membuat subscription: ' + subscriptionError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Subscriber berhasil ditambahkan dengan password: ${password}`,
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