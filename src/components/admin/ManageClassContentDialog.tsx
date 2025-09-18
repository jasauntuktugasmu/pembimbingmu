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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, HelpCircle, Play, BookOpen, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChapterManager } from './ChapterManager';

interface Materi {
  id: string;
  kelas_id: string;
  type: 'pretest' | 'video' | 'posttest' | 'chapter' | 'lesson';
  judul: string;
  link_video?: string;
  thumbnail?: string;
  order: number;
  parent_id?: string;
  deskripsi?: string;
}

interface VideoLink {
  id: string;
  materi_id: string;
  judul: string;
  link_youtube: string;
  thumbnail?: string;
  urutan: number;
}

interface Soal {
  id: string;
  materi_id: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: string;
}

interface Class {
  id: string;
  judul: string;
  deskripsi?: string;
}

interface ManageClassContentDialogProps {
  classData: Class;
  open: boolean;
  onClose: () => void;
}

export function ManageClassContentDialog({ classData, open, onClose }: ManageClassContentDialogProps) {
  const [materis, setMateris] = useState<Materi[]>([]);
  const [soals, setSoals] = useState<Record<string, Soal[]>>({});
  const [videoLinks, setVideoLinks] = useState<Record<string, VideoLink[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pretest');
  const [editingChapter, setEditingChapter] = useState<Materi | null>(null);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && classData.id) {
      fetchClassContent();
    }
  }, [open, classData.id]);

  const fetchClassContent = async () => {
    try {
      setLoading(true);

      // Fetch materis
      const { data: materiData, error: materiError } = await supabase
        .from('materi')
        .select('*')
        .eq('kelas_id', classData.id)
        .order('order');

      if (materiError) throw materiError;
      setMateris((materiData as Materi[]) || []);

      // Fetch soals and video links for each materi
      const soalPromises = (materiData || []).map(async (materi) => {
        if (materi.type === 'pretest' || materi.type === 'posttest') {
          const { data: soalData, error: soalError } = await supabase
            .from('soal')
            .select('*')
            .eq('materi_id', materi.id)
            .order('created_at');

          if (soalError) throw soalError;
          return { materiId: materi.id, soals: soalData || [] };
        }
        return { materiId: materi.id, soals: [] };
      });

      const videoPromises = (materiData || []).map(async (materi) => {
        if (materi.type === 'video') {
          const { data: videoData, error: videoError } = await supabase
            .from('video_links')
            .select('*')
            .eq('materi_id', materi.id)
            .order('urutan');

          if (videoError) throw videoError;
          return { materiId: materi.id, videos: videoData || [] };
        }
        return { materiId: materi.id, videos: [] };
      });

      const [soalResults, videoResults] = await Promise.all([
        Promise.all(soalPromises),
        Promise.all(videoPromises)
      ]);
      
      const soalMap = soalResults.reduce((acc, { materiId, soals }) => {
        acc[materiId] = soals;
        return acc;
      }, {} as Record<string, Soal[]>);

      const videoMap = videoResults.reduce((acc, { materiId, videos }) => {
        acc[materiId] = videos;
        return acc;
      }, {} as Record<string, VideoLink[]>);

      setSoals(soalMap);
      setVideoLinks(videoMap);
    } catch (error) {
      console.error('Error fetching class content:', error);
      toast({
        title: "Error",
        description: "Gagal memuat konten kelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMateri = async (type: 'pretest' | 'video' | 'posttest') => {
    try {
      const orderValue = type === 'pretest' ? 1 : type === 'video' ? 2 : 3;
      
      const { data, error } = await supabase
        .from('materi')
        .insert({
          kelas_id: classData.id,
          type: type,
          judul: `${type === 'pretest' ? 'Pre Test' : type === 'video' ? 'Video Materi' : 'Post Test'} - ${classData.judul}`,
          order: orderValue
        })
        .select()
        .single();

      if (error) throw error;

      await fetchClassContent();
      toast({
        title: "Berhasil",
        description: `${type} berhasil dibuat`,
      });
    } catch (error) {
      console.error('Error creating materi:', error);
      toast({
        title: "Error",
        description: "Gagal membuat materi",
        variant: "destructive"
      });
    }
  };

  const getMateriByType = (type: 'pretest' | 'video' | 'posttest') => {
    return materis.find(m => m.type === type);
  };

  const getMateriIcon = (type: string) => {
    switch (type) {
      case 'pretest':
        return <HelpCircle className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Play className="h-5 w-5 text-green-600" />;
      case 'posttest':
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Kelola Konten - {classData.judul}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="pretest" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Pre Test
              </TabsTrigger>
              <TabsTrigger value="chapters" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Sub Bab
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Video Materi
              </TabsTrigger>
              <TabsTrigger value="posttest" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Post Test
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chapters">
              <ChapterManager 
                classId={classData.id}
                chapters={materis.filter(m => m.type === 'chapter')}
                lessons={materis.filter(m => m.type === 'lesson')}
                videoLinks={videoLinks}
                onRefresh={fetchClassContent}
              />
            </TabsContent>

            <TabsContent value="pretest">
              <PreTestManager 
                classData={classData}
                materi={getMateriByType('pretest')}
                soals={soals[getMateriByType('pretest')?.id || ''] || []}
                onCreateMateri={() => createMateri('pretest')}
                onRefresh={fetchClassContent}
              />
            </TabsContent>

            <TabsContent value="video">
              <VideoManager 
                classData={classData}
                materi={getMateriByType('video')}
                videoLinks={videoLinks[getMateriByType('video')?.id || ''] || []}
                onCreateMateri={() => createMateri('video')}
                onRefresh={fetchClassContent}
              />
            </TabsContent>

            <TabsContent value="posttest">
              <PostTestManager 
                classData={classData}
                materi={getMateriByType('posttest')}
                soals={soals[getMateriByType('posttest')?.id || ''] || []}
                onCreateMateri={() => createMateri('posttest')}
                onRefresh={fetchClassContent}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Pre Test Manager Component
function PreTestManager({ 
  classData, 
  materi, 
  soals, 
  onCreateMateri, 
  onRefresh 
}: { 
  classData: Class; 
  materi?: Materi; 
  soals: Soal[]; 
  onCreateMateri: () => void;
  onRefresh: () => void;
}) {
  const [showAddSoal, setShowAddSoal] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);

  if (!materi) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Pre Test Belum Dibuat</h3>
          <p className="text-muted-foreground mb-4">
            Buat Pre Test untuk kelas "{classData.judul}" terlebih dahulu
          </p>
          <Button onClick={onCreateMateri} className="bg-[#81b59a] hover:bg-[#6da085]">
            <Plus className="h-4 w-4 mr-2" />
            Buat Pre Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Pre Test - {materi.judul}
            </CardTitle>
            <Button 
              onClick={() => setShowAddSoal(true)}
              className="bg-[#81b59a] hover:bg-[#6da085]"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {soals.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada soal Pre Test</p>
              <Button 
                onClick={() => setShowAddSoal(true)}
                variant="outline"
              >
                Tambah Soal Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {soals.map((soal, index) => (
                <SoalCard 
                  key={soal.id}
                  soal={soal}
                  index={index}
                  onEdit={() => setEditingSoal(soal)}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(showAddSoal || editingSoal) && (
        <SoalForm
          materiId={materi.id}
          soal={editingSoal}
          onClose={() => {
            setShowAddSoal(false);
            setEditingSoal(null);
          }}
          onSuccess={() => {
            setShowAddSoal(false);
            setEditingSoal(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Video Manager Component
function VideoManager({ 
  classData, 
  materi, 
  videoLinks,
  onCreateMateri, 
  onRefresh 
}: { 
  classData: Class; 
  materi?: Materi; 
  videoLinks: VideoLink[];
  onCreateMateri: () => void;
  onRefresh: () => void;
}) {
  const [newVideo, setNewVideo] = useState({
    judul: '',
    link_youtube: '',
    thumbnail: ''
  });
  const [editingVideo, setEditingVideo] = useState<VideoLink | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleNewVideoLinkChange = (url: string) => {
    setNewVideo(prev => ({ ...prev, link_youtube: url }));
    
    if (url) {
      const videoId = extractVideoId(url);
      if (videoId) {
        const autoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        setNewVideo(prev => ({ ...prev, thumbnail: autoThumbnail }));
      }
    }
  };

  const handleEditVideoLinkChange = (url: string) => {
    if (!editingVideo) return;
    setEditingVideo(prev => prev ? { ...prev, link_youtube: url } : null);
    
    if (url) {
      const videoId = extractVideoId(url);
      if (videoId) {
        const autoThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        setEditingVideo(prev => prev ? { ...prev, thumbnail: autoThumbnail } : null);
      }
    }
  };

  const addVideoLink = async () => {
    if (!materi || !newVideo.judul.trim() || !newVideo.link_youtube.trim()) return;

    setSaving(true);
    try {
      const nextUrutan = Math.max(...videoLinks.map(v => v.urutan), 0) + 1;
      
      const { error } = await supabase
        .from('video_links')
        .insert({
          materi_id: materi.id,
          judul: newVideo.judul.trim(),
          link_youtube: newVideo.link_youtube.trim(),
          thumbnail: newVideo.thumbnail.trim(),
          urutan: nextUrutan
        });

      if (error) throw error;

      setNewVideo({ judul: '', link_youtube: '', thumbnail: '' });
      setShowAddVideo(false);
      toast({
        title: "Berhasil",
        description: "Video berhasil ditambahkan",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan video",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateVideoLink = async () => {
    if (!editingVideo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('video_links')
        .update({
          judul: editingVideo.judul.trim(),
          link_youtube: editingVideo.link_youtube.trim(),
          thumbnail: editingVideo.thumbnail.trim()
        })
        .eq('id', editingVideo.id);

      if (error) throw error;

      setEditingVideo(null);
      toast({
        title: "Berhasil",
        description: "Video berhasil diperbarui",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui video",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteVideoLink = async (videoId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('video_links')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Video berhasil dihapus",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus video",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!materi) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Materi Belum Dibuat</h3>
          <p className="text-muted-foreground mb-4">
            Buat Video Materi untuk kelas "{classData.judul}" terlebih dahulu
          </p>
          <Button onClick={onCreateMateri} className="bg-[#81b59a] hover:bg-[#6da085]">
            <Plus className="h-4 w-4 mr-2" />
            Buat Video Materi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Video Materi - {classData.judul}
            </CardTitle>
            <Button 
              onClick={() => setShowAddVideo(true)}
              className="bg-[#81b59a] hover:bg-[#6da085]"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {videoLinks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada video yang ditambahkan</p>
              <Button 
                onClick={() => setShowAddVideo(true)}
                variant="outline"
              >
                Tambah Video Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {videoLinks.map((video, index) => (
                <VideoCard 
                  key={video.id}
                  video={video}
                  index={index}
                  onEdit={() => setEditingVideo(video)}
                  onDelete={() => deleteVideoLink(video.id)}
                  extractVideoId={extractVideoId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Video Form */}
      {showAddVideo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tambah Video Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddVideo(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-judul">Judul Video</Label>
              <Input
                id="new-judul"
                value={newVideo.judul}
                onChange={(e) => setNewVideo(prev => ({ ...prev, judul: e.target.value }))}
                placeholder="Masukkan judul video..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-link">Link YouTube</Label>
              <Input
                id="new-link"
                value={newVideo.link_youtube}
                onChange={(e) => handleNewVideoLinkChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {newVideo.link_youtube && (
              <div className="space-y-2">
                <Label>Preview Video</Label>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {(() => {
                    const videoId = extractVideoId(newVideo.link_youtube);
                    return videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Video Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>URL YouTube tidak valid</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={addVideoLink}
                disabled={saving || !newVideo.judul.trim() || !newVideo.link_youtube.trim()}
                className="bg-[#81b59a] hover:bg-[#6da085]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Video
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddVideo(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Video Form */}
      {editingVideo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Video</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingVideo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-judul">Judul Video</Label>
              <Input
                id="edit-judul"
                value={editingVideo.judul}
                onChange={(e) => setEditingVideo(prev => prev ? { ...prev, judul: e.target.value } : null)}
                placeholder="Masukkan judul video..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-link">Link YouTube</Label>
              <Input
                id="edit-link"
                value={editingVideo.link_youtube}
                onChange={(e) => handleEditVideoLinkChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {editingVideo.link_youtube && (
              <div className="space-y-2">
                <Label>Preview Video</Label>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {(() => {
                    const videoId = extractVideoId(editingVideo.link_youtube);
                    return videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Video Preview"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>URL YouTube tidak valid</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={updateVideoLink}
                disabled={saving || !editingVideo.judul.trim() || !editingVideo.link_youtube.trim()}
                className="bg-[#81b59a] hover:bg-[#6da085]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditingVideo(null)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// VideoCard Component
function VideoCard({ 
  video, 
  index, 
  onEdit, 
  onDelete,
  extractVideoId 
}: { 
  video: VideoLink; 
  index: number; 
  onEdit: () => void; 
  onDelete: () => void;
  extractVideoId: (url: string) => string | null;
}) {
  const videoId = extractVideoId(video.link_youtube);
  
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-32 h-20 bg-black rounded overflow-hidden">
            {videoId ? (
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt={video.judul}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-sm mb-1">{video.judul}</h4>
              <p className="text-xs text-muted-foreground mb-2">Video {index + 1}</p>
              <a 
                href={video.link_youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Lihat di YouTube
              </a>
            </div>
            
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Post Test Manager Component (similar to PreTestManager)
function PostTestManager({ 
  classData, 
  materi, 
  soals, 
  onCreateMateri, 
  onRefresh 
}: { 
  classData: Class; 
  materi?: Materi; 
  soals: Soal[]; 
  onCreateMateri: () => void;
  onRefresh: () => void;
}) {
  const [showAddSoal, setShowAddSoal] = useState(false);
  const [editingSoal, setEditingSoal] = useState<Soal | null>(null);

  if (!materi) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Post Test Belum Dibuat</h3>
          <p className="text-muted-foreground mb-4">
            Buat Post Test untuk kelas "{classData.judul}" terlebih dahulu
          </p>
          <Button onClick={onCreateMateri} className="bg-[#81b59a] hover:bg-[#6da085]">
            <Plus className="h-4 w-4 mr-2" />
            Buat Post Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Post Test - {materi.judul}
            </CardTitle>
            <Button 
              onClick={() => setShowAddSoal(true)}
              className="bg-[#81b59a] hover:bg-[#6da085]"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Soal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {soals.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-muted-foreground mb-4">Belum ada soal Post Test</p>
              <Button 
                onClick={() => setShowAddSoal(true)}
                variant="outline"
              >
                Tambah Soal Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {soals.map((soal, index) => (
                <SoalCard 
                  key={soal.id}
                  soal={soal}
                  index={index}
                  onEdit={() => setEditingSoal(soal)}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(showAddSoal || editingSoal) && (
        <SoalForm
          materiId={materi.id}
          soal={editingSoal}
          onClose={() => {
            setShowAddSoal(false);
            setEditingSoal(null);
          }}
          onSuccess={() => {
            setShowAddSoal(false);
            setEditingSoal(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// Soal Card Component
function SoalCard({ 
  soal, 
  index, 
  onEdit, 
  onRefresh 
}: { 
  soal: Soal; 
  index: number; 
  onEdit: () => void;
  onRefresh: () => void;
}) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;

    try {
      const { error } = await supabase
        .from('soal')
        .delete()
        .eq('id', soal.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Soal berhasil dihapus",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting soal:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus soal",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Soal {index + 1}</Badge>
              <Badge 
                variant="outline" 
                className={`${
                  soal.jawaban_benar === 'a' ? 'bg-green-100 text-green-800' :
                  soal.jawaban_benar === 'b' ? 'bg-blue-100 text-blue-800' :
                  soal.jawaban_benar === 'c' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                Jawaban: {soal.jawaban_benar.toUpperCase()}
              </Badge>
            </div>
            <p className="font-medium mb-3">{soal.pertanyaan}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>A. {soal.pilihan_a}</div>
              <div>B. {soal.pilihan_b}</div>
              <div>C. {soal.pilihan_c}</div>
              <div>D. {soal.pilihan_d}</div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Soal Form Component
function SoalForm({ 
  materiId, 
  soal, 
  onClose, 
  onSuccess 
}: { 
  materiId: string; 
  soal?: Soal | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [pertanyaan, setPertanyaan] = useState(soal?.pertanyaan || '');
  const [pilihanA, setPilihanA] = useState(soal?.pilihan_a || '');
  const [pilihanB, setPilihanB] = useState(soal?.pilihan_b || '');
  const [pilihanC, setPilihanC] = useState(soal?.pilihan_c || '');
  const [pilihanD, setPilihanD] = useState(soal?.pilihan_d || '');
  const [jawabanBenar, setJawabanBenar] = useState(soal?.jawaban_benar || 'a');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pertanyaan.trim() || !pilihanA.trim() || !pilihanB.trim() || !pilihanC.trim() || !pilihanD.trim()) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const soalData = {
        materi_id: materiId,
        pertanyaan: pertanyaan.trim(),
        pilihan_a: pilihanA.trim(),
        pilihan_b: pilihanB.trim(),
        pilihan_c: pilihanC.trim(),
        pilihan_d: pilihanD.trim(),
        jawaban_benar: jawabanBenar
      };

      if (soal) {
        const { error } = await supabase
          .from('soal')
          .update(soalData)
          .eq('id', soal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('soal')
          .insert(soalData);
        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: soal ? "Soal berhasil diperbarui" : "Soal berhasil ditambahkan",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving soal:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan soal",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{soal ? 'Edit Soal' : 'Tambah Soal Baru'}</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pertanyaan">Pertanyaan *</Label>
            <Textarea
              id="pertanyaan"
              value={pertanyaan}
              onChange={(e) => setPertanyaan(e.target.value)}
              placeholder="Masukkan pertanyaan..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pilihan_a">Pilihan A *</Label>
              <Input
                id="pilihan_a"
                value={pilihanA}
                onChange={(e) => setPilihanA(e.target.value)}
                placeholder="Pilihan A..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilihan_b">Pilihan B *</Label>
              <Input
                id="pilihan_b"
                value={pilihanB}
                onChange={(e) => setPilihanB(e.target.value)}
                placeholder="Pilihan B..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilihan_c">Pilihan C *</Label>
              <Input
                id="pilihan_c"
                value={pilihanC}
                onChange={(e) => setPilihanC(e.target.value)}
                placeholder="Pilihan C..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilihan_d">Pilihan D *</Label>
              <Input
                id="pilihan_d"
                value={pilihanD}
                onChange={(e) => setPilihanD(e.target.value)}
                placeholder="Pilihan D..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jawaban Benar *</Label>
            <div className="flex gap-4">
              {['a', 'b', 'c', 'd'].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={jawabanBenar === option}
                    onChange={(e) => setJawabanBenar(e.target.value)}
                  />
                  <span className="uppercase font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-[#81b59a] hover:bg-[#6da085]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {soal ? 'Update Soal' : 'Simpan Soal'}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}