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
  const [fullName, setFullName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailExistsMessage, setEmailExistsMessage] = useState('');
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

  const checkEmailExists = async (emailToCheck: string) => {
    if (!emailToCheck || emailToCheck.length < 3) {
      setEmailExists(false);
      setEmailExistsMessage('');
      return;
    }

    setCheckingEmail(true);
    try {
      // Check if email exists in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .ilike('email', emailToCheck)
        .limit(1);

      if (error) {
        console.error('Error checking email:', error);
        return;
      }

      if (data && data.length > 0) {
        setEmailExists(true);
        setEmailExistsMessage(`Email sudah digunakan oleh: ${data[0].full_name || 'User'}`);
      } else {
        setEmailExists(false);
        setEmailExistsMessage('');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Debounced email check
  useEffect(() => {
    const delayedCheck = setTimeout(() => {
      checkEmailExists(email);
    }, 500);

    return () => clearTimeout(delayedCheck);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !selectedPackage || !fullName) {
      toast({
        title: 'Error',
        description: 'Email, nama lengkap, dan paket harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (emailExists) {
      toast({
        title: 'Error',
        description: 'Email sudah terdaftar. Silakan gunakan email lain atau update subscriber yang sudah ada.',
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
          full_name: fullName,
          paket_id: selectedPackage,
          custom_duration: customDuration,
          custom_password: customPassword || undefined
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
        let errorMessage = 'Gagal membuat subscriber: ' + data.error;
        
        // Handle specific error cases
        if (data.errorCode === 'EMAIL_EXISTS') {
          errorMessage = data.details || 'Email sudah terdaftar';
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Subscriber ${data.user.full_name} berhasil ditambahkan dengan password: ${data.password}`,
      });

      // Reset form
      setEmail('');
      setFullName('');
      setCustomPassword('');
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
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama lengkap subscriber"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="subscriber@example.com"
          required
          className={emailExists ? 'border-destructive' : ''}
        />
        {checkingEmail && (
          <p className="text-sm text-muted-foreground mt-1">
            Mengecek ketersediaan email...
          </p>
        )}
        {emailExists && (
          <p className="text-sm text-destructive mt-1">
            ⚠️ {emailExistsMessage}
          </p>
        )}
        {!checkingEmail && !emailExists && email && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Email tersedia
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="customPassword">Password Custom (opsional)</Label>
        <Input
          id="customPassword"
          type="password"
          value={customPassword}
          onChange={(e) => setCustomPassword(e.target.value)}
          placeholder="Kosongkan untuk generate password otomatis"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Jika kosong, sistem akan generate password secara otomatis
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
        <Button type="submit" disabled={loading || emailExists || checkingEmail}>
          {loading ? 'Loading...' : 'Tambah Subscriber'}
        </Button>
      </div>
    </form>
  );
};