import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, BookOpen, Eye, ImageIcon, GraduationCap } from 'lucide-react';
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
import { ManageClassesDialog } from '@/components/admin/ManageClassesDialog';

interface Package {
  id: string;
  nama_paket: string;
  deskripsi: string;
  harga: number;
  durasi_hari: number;
  created_at: string;
  thumbnail_url?: string;
  courseCount?: number;
}

export const ManagePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [managingContentPackage, setManagingContentPackage] = useState<Package | null>(null);
  const [managingClassesPackage, setManagingClassesPackage] = useState<Package | null>(null);
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

      // Fetch course count for each package
      const packagesWithCourseCount = await Promise.all(
        (data || []).map(async (pkg) => {
          const { count } = await supabase
            .from('kelas')
            .select('*', { count: 'exact', head: true })
            .eq('paket_id', pkg.id);
          
          return {
            ...pkg,
            courseCount: count || 0
          };
        })
      );

      setPackages(packagesWithCourseCount);
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
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mobile-card-padding">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Manage Packages</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Kelola paket pembelajaran dan konten
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-admin-green hover:bg-admin-green-hover text-admin-green-foreground w-full md:w-auto touch-target">
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] md:max-w-lg">
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

      {/* Search - Full width on mobile */}
      <div className="flex items-center space-x-2 mobile-card-padding">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Cari berdasarkan nama atau deskripsi paket..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-sm"
        />
      </div>

      {/* Package Grid - Better mobile spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 md:transform md:hover:-translate-y-1 border-0 shadow-md mobile-card-padding">
            {/* Thumbnail Image */}
            <div className="relative h-40 md:h-48 bg-muted overflow-hidden">
              {pkg.thumbnail_url ? (
                <img 
                  src={pkg.thumbnail_url} 
                  alt={pkg.nama_paket}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <ImageIcon className="h-10 md:h-12 w-10 md:w-12 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs md:text-sm text-muted-foreground">No Image</span>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-3 md:p-4">
              <div className="space-y-3 md:space-y-4">
                {/* Title & Price */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                    {pkg.nama_paket}
                  </h3>
                  <p className="text-lg md:text-xl font-bold text-admin-green">
                    Rp {pkg.harga?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">
                  {pkg.deskripsi || 'Tidak ada deskripsi'}
                </p>
                
                {/* Package Info */}
                <div className="space-y-1 text-xs md:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Jumlah Kelas:</span>
                    <span className="font-medium">{pkg.courseCount || 0} kelas</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Durasi:</span>
                    <span className="font-medium">{pkg.durasi_hari} hari</span>
                  </div>
                </div>

                {/* Action Buttons - Mobile optimized */}
                <div className="flex flex-col space-y-2 md:space-y-3 pt-2 md:pt-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setManagingClassesPackage(pkg)}
                      className="flex-1 bg-[#81b59a] hover:bg-[#6da085] text-white touch-target text-xs md:text-sm"
                    >
                      <GraduationCap className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Classes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setManagingContentPackage(pkg)}
                      className="flex-1 bg-admin-green hover:bg-admin-green-hover text-admin-green-foreground touch-target text-xs md:text-sm"
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Content
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => setEditingPackage(pkg)}
                    className="w-full bg-admin-green hover:bg-admin-green-hover text-admin-green-foreground touch-target text-xs md:text-sm"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Edit Package
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="w-full touch-target text-xs md:text-sm"
                  >
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Tidak ada hasil' : 'Belum ada paket'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Tidak ada paket yang sesuai dengan pencarian Anda.'
                : 'Silakan tambahkan paket baru untuk memulai.'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-admin-green hover:bg-admin-green-hover text-admin-green-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Paket Baru
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Package Dialog */}
      <Dialog 
        open={!!editingPackage} 
        onOpenChange={(open) => !open && setEditingPackage(null)}
      >
        <DialogContent className="max-w-[95vw] md:max-w-lg">
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

      {/* Manage Classes Dialog */}
      {managingClassesPackage && (
        <ManageClassesDialog
          package={managingClassesPackage}
          open={!!managingClassesPackage}
          onClose={() => setManagingClassesPackage(null)}
        />
      )}
    </div>
  );
};