import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Class {
  id: string;
  paket_id: string;
  judul: string;
  deskripsi?: string;
  thumbnail_url?: string;
  rating: number;
  jumlah_review: number;
  durasi_menit: number;
  durasi_text?: string;
  urutan: number;
  is_active: boolean;
  pengajar: string;
  level: string;
  jumlah_user: number;
  harga_asli?: number;
  harga_diskon?: number;
  created_at: string;
  updated_at: string;
}

interface Package {
  id: string;
  nama_paket: string;
  deskripsi?: string;
}

interface ManageClassesDialogProps {
  package: Package;
  open: boolean;
  onClose: () => void;
}

export function ManageClassesDialog({ package: pkg, open, onClose }: ManageClassesDialogProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    if (open && pkg.id) {
      fetchClasses();
    }
  }, [open, pkg.id]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kelas')
        .select('*')
        .eq('paket_id', pkg.id)
        .order('urutan');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;

    try {
      const { error } = await supabase
        .from('kelas')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Kelas berhasil dihapus",
      });

      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus kelas",
        variant: "destructive"
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Kelola Kelas - {pkg.nama_paket}</span>
              {isSuperAdmin && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-[#81b59a] hover:bg-[#6da085] text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {classes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="mx-auto mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum ada kelas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Belum ada kelas dalam paket ini. Silakan tambahkan kelas pertama.
                  </p>
                  {isSuperAdmin && (
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-[#81b59a] hover:bg-[#6da085] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kelas Pertama
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {classes.map((classItem) => (
                    <Card key={classItem.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Thumbnail */}
                          <div className="w-48 h-32 bg-muted flex-shrink-0 relative">
                            {classItem.thumbnail_url ? (
                              <img
                                src={classItem.thumbnail_url}
                                alt={classItem.judul}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <span className="text-sm text-gray-500 font-medium">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* Class Info */}
                          <div className="flex-1 p-4 relative">
                            {/* Action Buttons - Only for Super Admin */}
                            {isSuperAdmin && (
                              <div className="absolute top-3 right-3 flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingClass(classItem)}
                                  className="h-8 w-8 p-0 bg-[#81b59a] hover:bg-[#6da085] text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                                  title="Edit Kelas"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClass(classItem.id)}
                                  className="h-8 w-8 p-0 shadow-md hover:shadow-lg transition-all duration-200"
                                  title="Hapus Kelas"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            <div className="pr-20">
                              <Badge className={`${getLevelColor(classItem.level)} mb-3 font-medium`}>
                                {classItem.level}
                              </Badge>
                              <h3 className="font-bold text-lg mb-2 text-gray-900 leading-tight">
                                {classItem.judul}
                              </h3>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex">
                                  {renderStars(classItem.rating)}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {classItem.rating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({classItem.jumlah_review})
                                </span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{classItem.jumlah_user}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{classItem.durasi_text || `${classItem.durasi_menit}m`}</span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-3 mb-4">
                                {classItem.harga_asli && (
                                  <span className="text-sm text-gray-400 line-through font-medium">
                                    Rp{classItem.harga_asli.toLocaleString('id-ID')}
                                  </span>
                                )}
                                {classItem.harga_diskon && (
                                  <span className="text-xl font-bold text-orange-600">
                                    Rp{classItem.harga_diskon.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>

                              {/* Lanjutkan Button */}
                              <Button
                                className="bg-[#81b59a] hover:bg-[#6da085] text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                size="sm"
                              >
                                Lanjutkan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Class Form Dialog */}
      <Dialog 
        open={showAddForm || !!editingClass} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingClass(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </DialogTitle>
          </DialogHeader>
          <ClassForm
            paketId={pkg.id}
            class={editingClass}
            maxUrutan={Math.max(...classes.map(c => c.urutan), 0)}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingClass(null);
              fetchClasses();
              toast({
                title: "Success",
                description: editingClass ? "Kelas berhasil diperbarui" : "Kelas berhasil ditambahkan",
              });
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingClass(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ClassFormProps {
  paketId: string;
  class?: Class | null;
  maxUrutan: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function ClassForm({ paketId, class: classData, maxUrutan, onSuccess, onCancel }: ClassFormProps) {
  const [judul, setJudul] = useState(classData?.judul || '');
  const [deskripsi, setDeskripsi] = useState(classData?.deskripsi || '');
  const [pengajar, setPengajar] = useState(classData?.pengajar || '');
  const [level, setLevel] = useState(classData?.level || 'Beginner');
  const [rating, setRating] = useState(classData?.rating || 5);
  const [jumlahReview, setJumlahReview] = useState(classData?.jumlah_review || 0);
  const [jumlahUser, setJumlahUser] = useState(classData?.jumlah_user || 0);
  const [durasiText, setDurasiText] = useState(classData?.durasi_text || '');
  const [durasiMenit, setDurasiMenit] = useState(classData?.durasi_menit || 0);
  const [hargaAsli, setHargaAsli] = useState(classData?.harga_asli?.toString() || '');
  const [hargaDiskon, setHargaDiskon] = useState(classData?.harga_diskon?.toString() || '');
  const [urutan, setUrutan] = useState(classData?.urutan || maxUrutan + 1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(classData?.thumbnail_url || null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file terlalu besar. Maksimal 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "File harus berupa gambar.",
          variant: "destructive"
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `class-thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('package-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('package-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!judul.trim() || !pengajar.trim()) {
      toast({
        title: "Error",
        description: "Judul dan pengajar harus diisi",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let thumbnailUrl = classData?.thumbnail_url;

      if (selectedImage) {
        thumbnailUrl = await uploadImage(selectedImage);
      }

      const classDataToSave = {
        paket_id: paketId,
        judul: judul.trim(),
        deskripsi: deskripsi.trim() || null,
        pengajar: pengajar.trim(),
        level,
        rating: Number(rating),
        jumlah_review: Number(jumlahReview),
        jumlah_user: Number(jumlahUser),
        durasi_text: durasiText.trim() || null,
        durasi_menit: Number(durasiMenit),
        harga_asli: hargaAsli ? Number(hargaAsli) : null,
        harga_diskon: hargaDiskon ? Number(hargaDiskon) : null,
        urutan: Number(urutan),
        thumbnail_url: thumbnailUrl,
        is_active: true,
      };

      if (classData) {
        const { error } = await supabase
          .from('kelas')
          .update(classDataToSave)
          .eq('id', classData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kelas')
          .insert(classDataToSave);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan kelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image" className="text-sm font-semibold">
            Thumbnail Kelas
          </Label>
          {imagePreview && (
            <div className="w-full h-40 bg-muted rounded-xl overflow-hidden mb-3 border-2 border-gray-200">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#81b59a] transition-colors"
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="judul" className="text-sm font-semibold">
            Judul Kelas *
          </Label>
          <Input
            id="judul"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            className="border-2 border-gray-200 focus:border-[#81b59a]"
            placeholder="Masukkan judul kelas"
          />
        </div>

        {/* Teacher */}
        <div className="space-y-2">
          <Label htmlFor="pengajar" className="text-sm font-semibold">
            Pengajar *
          </Label>
          <Input
            id="pengajar"
            value={pengajar}
            onChange={(e) => setPengajar(e.target.value)}
            required
            className="border-2 border-gray-200 focus:border-[#81b59a]"
            placeholder="Nama pengajar"
          />
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level" className="text-sm font-semibold">
            Level
          </Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#81b59a]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label htmlFor="rating" className="text-sm font-semibold">
            Rating (0-5)
          </Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Review Count */}
        <div className="space-y-2">
          <Label htmlFor="jumlahReview" className="text-sm font-semibold">
            Jumlah Review
          </Label>
          <Input
            id="jumlahReview"
            type="number"
            min="0"
            value={jumlahReview}
            onChange={(e) => setJumlahReview(Number(e.target.value))}
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* User Count */}
        <div className="space-y-2">
          <Label htmlFor="jumlahUser" className="text-sm font-semibold">
            Jumlah User Join
          </Label>
          <Input
            id="jumlahUser"
            type="number"
            min="0"
            value={jumlahUser}
            onChange={(e) => setJumlahUser(Number(e.target.value))}
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Duration Text */}
        <div className="space-y-2">
          <Label htmlFor="durasiText" className="text-sm font-semibold">
            Durasi (contoh: 5h 30m)
          </Label>
          <Input
            id="durasiText"
            value={durasiText}
            onChange={(e) => setDurasiText(e.target.value)}
            placeholder="5h 30m"
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Duration Minutes */}
        <div className="space-y-2">
          <Label htmlFor="durasi" className="text-sm font-semibold">
            Durasi (Menit)
          </Label>
          <Input
            id="durasi"
            type="number"
            min="0"
            value={durasiMenit}
            onChange={(e) => setDurasiMenit(Number(e.target.value))}
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Original Price */}
        <div className="space-y-2">
          <Label htmlFor="hargaAsli" className="text-sm font-semibold">
            Harga Asli (Rp)
          </Label>
          <Input
            id="hargaAsli"
            type="number"
            min="0"
            value={hargaAsli}
            onChange={(e) => setHargaAsli(e.target.value)}
            placeholder="299000"
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Discount Price */}
        <div className="space-y-2">
          <Label htmlFor="hargaDiskon" className="text-sm font-semibold">
            Harga Diskon (Rp)
          </Label>
          <Input
            id="hargaDiskon"
            type="number"
            min="0"
            value={hargaDiskon}
            onChange={(e) => setHargaDiskon(e.target.value)}
            placeholder="99000"
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>

        {/* Order */}
        <div className="space-y-2">
          <Label htmlFor="urutan" className="text-sm font-semibold">
            Urutan
          </Label>
          <Input
            id="urutan"
            type="number"
            min="1"
            value={urutan}
            onChange={(e) => setUrutan(Number(e.target.value))}
            className="border-2 border-gray-200 focus:border-[#81b59a]"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="deskripsi" className="text-sm font-semibold">
          Deskripsi Singkat
        </Label>
        <Textarea
          id="deskripsi"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={4}
          className="border-2 border-gray-200 focus:border-[#81b59a] resize-none"
          placeholder="Masukkan deskripsi kelas..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#81b59a] hover:bg-[#6da085] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? 'Menyimpan...' : (classData ? 'Update Kelas' : 'Simpan Kelas')}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all duration-200"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}