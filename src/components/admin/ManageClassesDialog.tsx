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
import { Plus, Edit, Trash2, Upload, Star, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (open && pkg.id) {
      fetchClasses();
    }
  }, [open, pkg.id]);

  const fetchClasses = async () => {
    try {
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
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Kelola Kelas - {pkg.nama_paket}
            <Button
              onClick={() => setShowAddForm(true)}
              className="ml-auto bg-[#81b59a] hover:bg-[#6da085] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kelas
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Belum ada kelas dalam paket ini
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-[#81b59a] hover:bg-[#6da085] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {classes.map((classItem) => (
                  <Card key={classItem.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Thumbnail */}
                        <div className="w-48 h-32 bg-muted flex-shrink-0">
                          {classItem.thumbnail_url ? (
                            <img
                              src={classItem.thumbnail_url}
                              alt={classItem.judul}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-sm text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Class Info */}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <Badge className={`${getLevelColor(classItem.level)} mb-2`}>
                                {classItem.level}
                              </Badge>
                              <h3 className="font-semibold text-lg mb-1">
                                {classItem.judul}
                              </h3>
                              
                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {renderStars(classItem.rating)}
                                </div>
                                <span className="text-sm font-medium">
                                  {classItem.rating.toFixed(1)} ({classItem.jumlah_review})
                                </span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{classItem.jumlah_user}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{classItem.durasi_text || `${classItem.durasi_menit}m`}</span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-2">
                                {classItem.harga_asli && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    Rp{classItem.harga_asli.toLocaleString('id-ID')}
                                  </span>
                                )}
                                {classItem.harga_diskon && (
                                  <span className="text-lg font-bold text-orange-600">
                                    Rp{classItem.harga_diskon.toLocaleString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingClass(classItem)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClass(classItem.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Add/Edit Class Form */}
        {(showAddForm || editingClass) && (
          <ClassForm
            paketId={pkg.id}
            class={editingClass}
            maxUrutan={Math.max(...classes.map(c => c.urutan), 0)}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingClass(null);
              fetchClasses();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingClass(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
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
  const [hargaAsli, setHargaAsli] = useState(classData?.harga_asli || '');
  const [hargaDiskon, setHargaDiskon] = useState(classData?.harga_diskon || '');
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
    setLoading(true);

    try {
      let thumbnailUrl = classData?.thumbnail_url;

      if (selectedImage) {
        thumbnailUrl = await uploadImage(selectedImage);
      }

      const classDataToSave = {
        paket_id: paketId,
        judul,
        deskripsi,
        pengajar,
        level,
        rating: Number(rating),
        jumlah_review: Number(jumlahReview),
        jumlah_user: Number(jumlahUser),
        durasi_text: durasiText,
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

        toast({
          title: "Success",
          description: "Kelas berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from('kelas')
          .insert(classDataToSave);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Kelas berhasil ditambahkan",
        });
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
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold mb-4">
        {classData ? 'Edit Kelas' : 'Tambah Kelas Baru'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Thumbnail Kelas</Label>
            {imagePreview && (
              <div className="w-full h-32 bg-muted rounded-lg overflow-hidden mb-2">
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
              className="cursor-pointer"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Kelas *</Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
            />
          </div>

          {/* Teacher */}
          <div className="space-y-2">
            <Label htmlFor="pengajar">Pengajar *</Label>
            <Input
              id="pengajar"
              value={pengajar}
              onChange={(e) => setPengajar(e.target.value)}
              required
            />
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
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
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>

          {/* Review Count */}
          <div className="space-y-2">
            <Label htmlFor="jumlahReview">Jumlah Review</Label>
            <Input
              id="jumlahReview"
              type="number"
              min="0"
              value={jumlahReview}
              onChange={(e) => setJumlahReview(Number(e.target.value))}
            />
          </div>

          {/* User Count */}
          <div className="space-y-2">
            <Label htmlFor="jumlahUser">Jumlah User Join</Label>
            <Input
              id="jumlahUser"
              type="number"
              min="0"
              value={jumlahUser}
              onChange={(e) => setJumlahUser(Number(e.target.value))}
            />
          </div>

          {/* Duration Text */}
          <div className="space-y-2">
            <Label htmlFor="durasiText">Durasi (contoh: 5h 30m)</Label>
            <Input
              id="durasiText"
              value={durasiText}
              onChange={(e) => setDurasiText(e.target.value)}
              placeholder="5h 30m"
            />
          </div>

          {/* Duration Minutes */}
          <div className="space-y-2">
            <Label htmlFor="durasi">Durasi (Menit)</Label>
            <Input
              id="durasi"
              type="number"
              min="0"
              value={durasiMenit}
              onChange={(e) => setDurasiMenit(Number(e.target.value))}
            />
          </div>

          {/* Original Price */}
          <div className="space-y-2">
            <Label htmlFor="hargaAsli">Harga Asli (Rp)</Label>
            <Input
              id="hargaAsli"
              type="number"
              min="0"
              value={hargaAsli}
              onChange={(e) => setHargaAsli(e.target.value)}
              placeholder="299000"
            />
          </div>

          {/* Discount Price */}
          <div className="space-y-2">
            <Label htmlFor="hargaDiskon">Harga Diskon (Rp)</Label>
            <Input
              id="hargaDiskon"
              type="number"
              min="0"
              value={hargaDiskon}
              onChange={(e) => setHargaDiskon(e.target.value)}
              placeholder="99000"
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              type="number"
              min="1"
              value={urutan}
              onChange={(e) => setUrutan(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="deskripsi">Deskripsi Singkat</Label>
          <Textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#81b59a] hover:bg-[#6da085] text-white"
          >
            {loading ? 'Menyimpan...' : (classData ? 'Update Kelas' : 'Simpan Kelas')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}