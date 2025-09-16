import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AddPackageFormProps {
  onSuccess: () => void;
}

export const AddPackageForm: React.FC<AddPackageFormProps> = ({ onSuccess }) => {
  const [namaPacket, setNamaPacket] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [durasiHari, setDurasiHari] = useState('30');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!namaPacket || !durasiHari) {
      toast({
        title: 'Error',
        description: 'Nama paket dan durasi harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('paket_pembelajaran')
        .insert({
          nama_paket: namaPacket,
          deskripsi: deskripsi || null,
          harga: harga ? parseFloat(harga) : null,
          durasi_hari: parseInt(durasiHari),
        });

      if (error) {
        console.error('Error creating package:', error);
        toast({
          title: 'Error',
          description: 'Gagal membuat paket: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Paket berhasil dibuat',
      });

      // Reset form
      setNamaPacket('');
      setDeskripsi('');
      setHarga('');
      setDurasiHari('30');
      
      onSuccess();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat membuat paket',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nama">Nama Paket</Label>
        <Input
          id="nama"
          value={namaPacket}
          onChange={(e) => setNamaPacket(e.target.value)}
          placeholder="Contoh: Paket A - Basic"
          required
        />
      </div>

      <div>
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Deskripsi paket pembelajaran..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="harga">Harga (Rp)</Label>
        <Input
          id="harga"
          type="number"
          value={harga}
          onChange={(e) => setHarga(e.target.value)}
          placeholder="99000"
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="durasi">Durasi (hari)</Label>
        <Input
          id="durasi"
          type="number"
          value={durasiHari}
          onChange={(e) => setDurasiHari(e.target.value)}
          placeholder="30"
          min="1"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Buat Paket'}
        </Button>
      </div>
    </form>
  );
};