import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddPackageForm } from '@/components/admin/AddPackageForm';
import { EditPackageForm } from '@/components/admin/EditPackageForm';
import { ManageContentDialog } from '@/components/admin/ManageContentDialog';

interface Package {
  id: string;
  nama_paket: string;
  deskripsi: string;
  harga: number;
  durasi_hari: number;
  created_at: string;
}

export const ManagePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [managingContentPackage, setManagingContentPackage] = useState<Package | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('paket_pembelajaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: 'Error',
          description: 'Gagal memuat data paket',
          variant: 'destructive',
        });
        return;
      }

      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini? Semua konten dan subscriber akan terpengaruh.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('paket_pembelajaran')
        .delete()
        .eq('id', packageId);

      if (error) {
        console.error('Error deleting package:', error);
        toast({
          title: 'Error',
          description: 'Gagal menghapus paket',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Paket berhasil dihapus',
      });

      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.nama_paket.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-foreground">Manage Packages</h1>
          <p className="text-muted-foreground">
            Kelola paket pembelajaran dan konten
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Paket Baru</DialogTitle>
            </DialogHeader>
            <AddPackageForm 
              onSuccess={() => {
                setShowAddDialog(false);
                fetchPackages();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama atau deskripsi paket..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{pkg.nama_paket}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {pkg.deskripsi || 'Tidak ada deskripsi'}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga:</span>
                    <span className="font-medium">
                      Rp {pkg.harga?.toLocaleString('id-ID') || '0'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durasi:</span>
                    <span className="font-medium">{pkg.durasi_hari} hari</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManagingContentPackage(pkg)}
                    className="w-full"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Manage Content
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPackage(pkg)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Tidak ada hasil' : 'Belum ada paket'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? 'Tidak ada paket yang sesuai dengan pencarian Anda.'
                : 'Tambahkan paket baru untuk memulai.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Package Dialog */}
      <Dialog 
        open={!!editingPackage} 
        onOpenChange={(open) => !open && setEditingPackage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paket</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <EditPackageForm 
              package={editingPackage}
              onSuccess={() => {
                setEditingPackage(null);
                fetchPackages();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Content Dialog */}
      {managingContentPackage && (
        <ManageContentDialog
          package={managingContentPackage}
          open={!!managingContentPackage}
          onClose={() => setManagingContentPackage(null)}
        />
      )}
    </div>
  );
};