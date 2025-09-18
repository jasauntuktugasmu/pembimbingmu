import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ImageIcon } from 'lucide-react';

interface AddPackageFormProps {
  onSuccess: () => void;
}

export const AddPackageForm: React.FC<AddPackageFormProps> = ({ onSuccess }) => {
  const [namaPacket, setNamaPacket] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [durasiHari, setDurasiHari] = useState('30');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Error',
          description: 'Ukuran file maksimal 5MB',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'File harus berupa gambar',
          variant: 'destructive',
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (packageId: string): Promise<string | null> => {
    if (!selectedImage) return null;

    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${packageId}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('package-images')
      .upload(filePath, selectedImage, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('package-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

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
      // First create the package
      const { data: packageData, error: packageError } = await supabase
        .from('paket_pembelajaran')
        .insert({
          nama_paket: namaPacket,
          deskripsi: deskripsi || null,
          harga: harga ? parseFloat(harga) : null,
          durasi_hari: parseInt(durasiHari),
        })
        .select()
        .single();

      if (packageError) {
        console.error('Error creating package:', packageError);
        toast({
          title: 'Error',
          description: 'Gagal membuat paket: ' + packageError.message,
          variant: 'destructive',
        });
        return;
      }

      // Upload image if selected
      let thumbnailUrl = null;
      if (selectedImage && packageData) {
        try {
          thumbnailUrl = await uploadImage(packageData.id);
          
          // Update package with image URL
          const { error: updateError } = await supabase
            .from('paket_pembelajaran')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', packageData.id);

          if (updateError) {
            console.error('Error updating package with image:', updateError);
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast({
            title: 'Warning',
            description: 'Paket berhasil dibuat tapi gagal upload gambar',
            variant: 'destructive',
          });
        }
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
      setSelectedImage(null);
      setImagePreview(null);
      
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

      <div>
        <Label htmlFor="image">Gambar Paket</Label>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Pilih gambar untuk paket (max 5MB)
                </p>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Gambar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Buat Paket'}
        </Button>
      </div>
    </form>
  );
};