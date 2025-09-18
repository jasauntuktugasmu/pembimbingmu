import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Palette } from 'lucide-react';

interface Package {
  id: string;
  nama_paket: string;
  deskripsi?: string;
  harga?: number;
  durasi_hari: number;
  background_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  button_text?: string;
  category_link?: string;
  icon_url?: string;
  thumbnail_url?: string;
}

interface EditPackageModalProps {
  package: Package;
  onUpdate: () => void;
}

const colorPresets = [
  { name: 'Orange', from: '#f97316', to: '#fb923c' },
  { name: 'Purple', from: '#8b5cf6', to: '#a78bfa' },
  { name: 'Blue', from: '#3b82f6', to: '#60a5fa' },
  { name: 'Green', from: '#10b981', to: '#34d399' },
  { name: 'Pink', from: '#ec4899', to: '#f472b6' },
  { name: 'Indigo', from: '#6366f1', to: '#818cf8' },
];

export default function EditPackageModal({ package: pkg, onUpdate }: EditPackageModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_paket: pkg.nama_paket,
    deskripsi: pkg.deskripsi || '',
    button_text: pkg.button_text || 'Mulai Kelas',
    gradient_from: pkg.gradient_from || '#f97316',
    gradient_to: pkg.gradient_to || '#fb923c',
    category_link: pkg.category_link || '',
    icon_url: pkg.icon_url || '',
    thumbnail_url: pkg.thumbnail_url || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      nama_paket: pkg.nama_paket,
      deskripsi: pkg.deskripsi || '',
      button_text: pkg.button_text || 'Mulai Kelas',
      gradient_from: pkg.gradient_from || '#f97316',
      gradient_to: pkg.gradient_to || '#fb923c',
      category_link: pkg.category_link || '',
      icon_url: pkg.icon_url || '',
      thumbnail_url: pkg.thumbnail_url || '',
    });
  }, [pkg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('paket_pembelajaran')
        .update({
          nama_paket: formData.nama_paket,
          deskripsi: formData.deskripsi,
          button_text: formData.button_text,
          gradient_from: formData.gradient_from,
          gradient_to: formData.gradient_to,
          background_color: formData.gradient_from,
          category_link: formData.category_link,
          icon_url: formData.icon_url,
          thumbnail_url: formData.thumbnail_url,
        })
        .eq('id', pkg.id);

      if (error) throw error;

      toast({
        title: "Package Updated",
        description: "Package details have been updated successfully",
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyColorPreset = (preset: { from: string; to: string }) => {
    setFormData(prev => ({
      ...prev,
      gradient_from: preset.from,
      gradient_to: preset.to,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_paket">Package Name</Label>
            <Input
              id="nama_paket"
              value={formData.nama_paket}
              onChange={(e) => setFormData(prev => ({ ...prev, nama_paket: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Description</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_text">Button Text</Label>
            <Input
              id="button_text"
              value={formData.button_text}
              onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  className="h-12 p-0 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                  onClick={() => applyColorPreset(preset)}
                >
                  <span className="text-white text-xs font-medium">{preset.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="gradient_from">From Color</Label>
                <Input
                  id="gradient_from"
                  type="color"
                  value={formData.gradient_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="gradient_to">To Color</Label>
                <Input
                  id="gradient_to"
                  type="color"
                  value={formData.gradient_to}
                  onChange={(e) => setFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_link">Category Link</Label>
            <Input
              id="category_link"
              value={formData.category_link}
              onChange={(e) => setFormData(prev => ({ ...prev, category_link: e.target.value }))}
              placeholder="/lms/packages/basic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_url">Icon URL</Label>
            <Input
              id="icon_url"
              value={formData.icon_url}
              onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
              placeholder="https://example.com/icon.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">Background Image URL</Label>
            <Input
              id="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              placeholder="https://example.com/background.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}