import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: string;
  nama_paket: string;
}

interface Content {
  id: string;
  judul: string;
  konten: string;
  urutan: number;
}

interface ManageContentDialogProps {
  package: Package;
  open: boolean;
  onClose: () => void;
}

export const ManageContentDialog: React.FC<ManageContentDialogProps> = ({
  package: pkg,
  open,
  onClose,
}) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchContents();
    }
  }, [open, pkg.id]);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('paket_content')
        .select('*')
        .eq('paket_id', pkg.id)
        .order('urutan');

      if (error) {
        console.error('Error fetching contents:', error);
        return;
      }

      setContents(data || []);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('paket_content')
        .delete()
        .eq('id', contentId);

      if (error) {
        console.error('Error deleting content:', error);
        toast({
          title: 'Error',
          description: 'Gagal menghapus konten',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Konten berhasil dihapus',
      });

      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Content - {pkg.nama_paket}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Content Button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Konten
            </Button>
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingContent) && (
            <ContentForm
              paketId={pkg.id}
              content={editingContent}
              maxUrutan={Math.max(...contents.map(c => c.urutan), 0)}
              onSuccess={() => {
                setShowAddForm(false);
                setEditingContent(null);
                fetchContents();
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingContent(null);
              }}
            />
          )}

          {/* Content List */}
          <div className="space-y-4">
            {contents.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Belum ada konten</h3>
                  <p className="text-muted-foreground text-center">
                    Tambahkan konten pembelajaran untuk paket ini.
                  </p>
                </CardContent>
              </Card>
            ) : (
              contents.map((content) => (
                <Card key={content.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{content.judul}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          (Urutan: {content.urutan})
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingContent(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {content.konten || 'Tidak ada konten'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ContentFormProps {
  paketId: string;
  content?: Content | null;
  maxUrutan: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({
  paketId,
  content,
  maxUrutan,
  onSuccess,
  onCancel,
}) => {
  const [judul, setJudul] = useState(content?.judul || '');
  const [konten, setKonten] = useState(content?.konten || '');
  const [urutan, setUrutan] = useState(content?.urutan?.toString() || (maxUrutan + 1).toString());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!judul) {
      toast({
        title: 'Error',
        description: 'Judul harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const data = {
        judul,
        konten: konten || null,
        urutan: parseInt(urutan),
      };

      let error;
      if (content) {
        // Update existing content
        ({ error } = await supabase
          .from('paket_content')
          .update(data)
          .eq('id', content.id));
      } else {
        // Create new content
        ({ error } = await supabase
          .from('paket_content')
          .insert({
            ...data,
            paket_id: paketId,
          }));
      }

      if (error) {
        console.error('Error saving content:', error);
        toast({
          title: 'Error',
          description: 'Gagal menyimpan konten: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: content ? 'Konten berhasil diupdate' : 'Konten berhasil ditambahkan',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan konten',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content ? 'Edit Konten' : 'Tambah Konten Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul materi pembelajaran..."
              required
            />
          </div>

          <div>
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              type="number"
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="konten">Konten</Label>
            <Textarea
              id="konten"
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Isi konten pembelajaran..."
              rows={10}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : content ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};