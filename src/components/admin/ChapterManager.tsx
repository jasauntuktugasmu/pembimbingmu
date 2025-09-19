import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Play, BookOpen, Save, X, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  deskripsi?: string;
}

interface ChapterManagerProps {
  classId: string;
  chapters: Materi[];
  lessons: Materi[];
  videoLinks: Record<string, VideoLink[]>;
  onRefresh: () => void;
}

export function ChapterManager({ classId, chapters, lessons, videoLinks, onRefresh }: ChapterManagerProps) {
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Materi | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Materi | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState<Materi | null>(null);
  const { toast } = useToast();

  const createChapter = async () => {
    try {
      const maxOrder = Math.max(0, ...chapters.map(c => c.order));
      
      const { data, error } = await supabase
        .from('materi')
        .insert({
          kelas_id: classId,
          type: 'chapter',
          judul: 'Bab Baru',
          order: maxOrder + 1,
          deskripsi: 'Deskripsi bab'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chapter:', error);
        toast({
          title: "Error",
          description: `Gagal membuat bab baru: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Chapter created successfully:', data);
      toast({
        title: "Sukses",
        description: "Bab baru berhasil dibuat",
      });
      onRefresh();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan tidak terduga",
        variant: "destructive",
      });
    }
  };

  const createLesson = async (chapterId: string) => {
    try {
      const chapterLessons = lessons.filter(l => l.parent_id === chapterId);
      const maxOrder = Math.max(0, ...chapterLessons.map(l => l.order));
      
      const { data, error } = await supabase
        .from('materi')
        .insert({
          kelas_id: classId,
          type: 'lesson',
          judul: 'Pelajaran Baru',
          parent_id: chapterId,
          order: maxOrder + 1,
          deskripsi: 'Deskripsi pelajaran'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson:', error);
        toast({
          title: "Error",
          description: `Gagal membuat pelajaran baru: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Lesson created successfully:', data);
      toast({
        title: "Sukses",
        description: "Pelajaran baru berhasil dibuat",
      });
      onRefresh();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "Terjadi kesalahan tidak terduga",
        variant: "destructive",
      });
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm('Yakin ingin menghapus bab ini? Semua pelajaran di dalamnya akan ikut terhapus.')) {
      return;
    }

    const { error } = await supabase
      .from('materi')
      .delete()
      .eq('id', chapterId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus bab",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukses",
      description: "Bab berhasil dihapus",
    });
    onRefresh();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Yakin ingin menghapus pelajaran ini?')) {
      return;
    }

    const { error } = await supabase
      .from('materi')
      .delete()
      .eq('id', lessonId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus pelajaran",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sukses",
      description: "Pelajaran berhasil dihapus",
    });
    onRefresh();
  };

  const chapterLessons = (chapterId: string) => 
    lessons.filter(l => l.parent_id === chapterId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manajemen Sub Bab</h3>
        <Button onClick={createChapter} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tambah Bab
        </Button>
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada bab. Klik "Tambah Bab" untuk memulai.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {chapters.sort((a, b) => a.order - b.order).map((chapter) => (
            <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{chapter.judul}</span>
                    <Badge variant="outline">
                      {chapterLessons(chapter.id).length} pelajaran
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChapter(chapter);
                        setShowChapterForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChapter(chapter.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{chapter.deskripsi}</p>
                  
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Pelajaran</h4>
                    <Button
                      size="sm"
                      onClick={() => createLesson(chapter.id)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Pelajaran
                    </Button>
                  </div>

                  {chapterLessons(chapter.id).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Belum ada pelajaran
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chapterLessons(chapter.id).map((lesson) => (
                        <Card key={lesson.id} className="bg-muted/30">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span className="font-medium">{lesson.judul}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {videoLinks[lesson.id]?.length || 0} video
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLessonForVideo(lesson);
                                    setShowVideoManager(true);
                                  }}
                                  title="Kelola Video"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLesson(lesson);
                                    setShowLessonForm(true);
                                  }}
                                  title="Edit Lesson"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteLesson(lesson.id)}
                                  title="Hapus Lesson"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {lesson.deskripsi && (
                              <p className="text-sm text-muted-foreground mt-2">{lesson.deskripsi}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Chapter Form Dialog */}
      <ChapterForm
        open={showChapterForm}
        onClose={() => {
          setShowChapterForm(false);
          setEditingChapter(null);
        }}
        chapter={editingChapter}
        classId={classId}
        onSuccess={() => {
          setShowChapterForm(false);
          setEditingChapter(null);
          onRefresh();
        }}
      />

      {/* Lesson Form Dialog */}
      <LessonForm
        open={showLessonForm}
        onClose={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
        }}
        lesson={editingLesson}
        classId={classId}
        onSuccess={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
          onRefresh();
        }}
      />

      {/* Video Manager Dialog */}
      <LessonVideoManager
        open={showVideoManager}
        onClose={() => {
          setShowVideoManager(false);
          setSelectedLessonForVideo(null);
        }}
        lesson={selectedLessonForVideo}
        videoLinks={selectedLessonForVideo ? videoLinks[selectedLessonForVideo.id] || [] : []}
        onRefresh={() => {
          setShowVideoManager(false);
          setSelectedLessonForVideo(null);
          onRefresh();
        }}
      />
    </div>
  );
}

interface LessonVideoManagerProps {
  open: boolean;
  onClose: () => void;
  lesson: Materi | null;
  videoLinks: VideoLink[];
  onRefresh: () => void;
}

function LessonVideoManager({ open, onClose, lesson, videoLinks, onRefresh }: LessonVideoManagerProps) {
  const [newVideo, setNewVideo] = useState({
    judul: '',
    link_youtube: '',
    thumbnail: '',
    deskripsi: ''
  });
  const [editingVideo, setEditingVideo] = useState<VideoLink | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const addVideo = async () => {
    if (!lesson || !newVideo.judul.trim() || !newVideo.link_youtube.trim()) return;

    setLoading(true);
    try {
      const nextUrutan = Math.max(...videoLinks.map(v => v.urutan), 0) + 1;
      
      const { error } = await supabase
        .from('video_links')
        .insert({
          materi_id: lesson.id,
          judul: newVideo.judul.trim(),
          link_youtube: newVideo.link_youtube.trim(),
          thumbnail: newVideo.thumbnail.trim(),
          deskripsi: newVideo.deskripsi.trim(),
          urutan: nextUrutan
        });

      if (error) throw error;

      setNewVideo({ judul: '', link_youtube: '', thumbnail: '', deskripsi: '' });
      setShowAddForm(false);
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
      setLoading(false);
    }
  };

  const updateVideo = async () => {
    if (!editingVideo) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('video_links')
        .update({
          judul: editingVideo.judul.trim(),
          link_youtube: editingVideo.link_youtube.trim(),
          thumbnail: editingVideo.thumbnail.trim(),
          deskripsi: editingVideo.deskripsi?.trim()
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
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Yakin ingin menghapus video ini?')) return;

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
    }
  };

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Kelola Video - {lesson.judul}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Video Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Mengelola video untuk lesson "{lesson.judul}"
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Video
            </Button>
          </div>

          {/* Add Video Form */}
          {showAddForm && (
            <Card className="p-4 border-dashed">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-judul">Judul Video *</Label>
                  <Input
                    id="new-judul"
                    value={newVideo.judul}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, judul: e.target.value }))}
                    placeholder="Masukkan judul video"
                  />
                </div>
                <div>
                  <Label htmlFor="new-deskripsi">Deskripsi Pembelajaran</Label>
                  <Textarea
                    id="new-deskripsi"
                    value={newVideo.deskripsi}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, deskripsi: e.target.value }))}
                    placeholder="Masukkan penjelasan lengkap tentang materi yang akan dipelajari dalam video ini..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="new-link">Link YouTube *</Label>
                  <Input
                    id="new-link"
                    value={newVideo.link_youtube}
                    onChange={(e) => handleNewVideoLinkChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddForm(false);
                    setNewVideo({ judul: '', link_youtube: '', thumbnail: '', deskripsi: '' });
                  }}>
                    Batal
                  </Button>
                  <Button onClick={addVideo} disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Video"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Video List */}
          {videoLinks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Belum ada video untuk lesson ini</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddForm(true)}
              >
                Tambah Video Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {videoLinks.sort((a, b) => a.urutan - b.urutan).map(video => (
                <Card key={video.id} className="p-4">
                  {editingVideo?.id === video.id ? (
                    // Edit Form
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="edit-judul">Judul Video</Label>
                         <Input
                           id="edit-judul"
                           value={editingVideo.judul}
                           onChange={(e) => setEditingVideo(prev => prev ? { ...prev, judul: e.target.value } : null)}
                         />
                       </div>
                       <div>
                         <Label htmlFor="edit-deskripsi">Deskripsi Pembelajaran</Label>
                         <Textarea
                           id="edit-deskripsi"
                           value={editingVideo.deskripsi || ''}
                           onChange={(e) => setEditingVideo(prev => prev ? { ...prev, deskripsi: e.target.value } : null)}
                           placeholder="Masukkan penjelasan lengkap tentang materi yang akan dipelajari dalam video ini..."
                           rows={4}
                         />
                       </div>
                       <div>
                         <Label htmlFor="edit-link">Link YouTube</Label>
                         <Input
                           id="edit-link"
                           value={editingVideo.link_youtube}
                           onChange={(e) => handleEditVideoLinkChange(e.target.value)}
                         />
                       </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingVideo(null)}>
                          Batal
                        </Button>
                        <Button onClick={updateVideo} disabled={loading}>
                          {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {video.thumbnail && (
                          <img 
                            src={video.thumbnail} 
                            alt={video.judul}
                            className="w-16 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{video.judul}</h4>
                          <p className="text-sm text-muted-foreground">Video {video.urutan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ChapterFormProps {
  open: boolean;
  onClose: () => void;
  chapter: Materi | null;
  classId: string;
  onSuccess: () => void;
}

function ChapterForm({ open, onClose, chapter, classId, onSuccess }: ChapterFormProps) {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (chapter) {
      setJudul(chapter.judul);
      setDeskripsi(chapter.deskripsi || '');
    } else {
      setJudul('');
      setDeskripsi('');
    }
  }, [chapter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (chapter) {
        // Update
        const { error } = await supabase
          .from('materi')
          .update({ judul, deskripsi })
          .eq('id', chapter.id);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Bab berhasil diperbarui",
        });
      } else {
        // Create - handled by parent component
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{chapter ? 'Edit Bab' : 'Tambah Bab'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="judul">Judul Bab</Label>
              <Input
                id="judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul bab"
                required
              />
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Masukkan deskripsi bab (opsional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}

interface LessonFormProps {
  open: boolean;
  onClose: () => void;
  lesson: Materi | null;
  classId: string;
  onSuccess: () => void;
}

function LessonForm({ open, onClose, lesson, classId, onSuccess }: LessonFormProps) {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (lesson) {
      setJudul(lesson.judul);
      setDeskripsi(lesson.deskripsi || '');
    } else {
      setJudul('');
      setDeskripsi('');
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (lesson) {
        // Update
        const { error } = await supabase
          .from('materi')
          .update({ judul, deskripsi })
          .eq('id', lesson.id);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Pelajaran berhasil diperbarui",
        });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{lesson ? 'Edit Pelajaran' : 'Tambah Pelajaran'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="judul">Judul Pelajaran</Label>
              <Input
                id="judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul pelajaran"
                required
              />
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Masukkan deskripsi pelajaran"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}