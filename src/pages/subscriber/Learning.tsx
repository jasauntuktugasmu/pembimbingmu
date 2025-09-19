import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, Play, BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PreTest from '@/components/learning/PreTest';
import VideoPlayer from '@/components/learning/VideoPlayer';
import PostTest from '@/components/learning/PostTest';
import SEO from '@/components/SEO';

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

interface Progress {
  id: string;
  user_id: string;
  materi_id: string;
  status: 'incomplete' | 'complete';
  skor?: number;
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

interface Class {
  id: string;
  judul: string;
  deskripsi?: string;
}

export default function Learning() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [materis, setMateris] = useState<Materi[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [videoLinks, setVideoLinks] = useState<Record<string, VideoLink[]>>({});
  const [currentMateri, setCurrentMateri] = useState<Materi | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoLink | null>(null);
  const [showVideoList, setShowVideoList] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create ordered list of materials for proper sequential access
  const getOrderedMaterials = () => {
    const pretest = materis.find(m => m.type === 'pretest');
    const chapters = materis.filter(m => m.type === 'chapter').sort((a, b) => a.order - b.order);
    const lessons = materis.filter(m => m.type === 'lesson');
    const videos = materis.filter(m => m.type === 'video').sort((a, b) => a.order - b.order);
    const posttest = materis.find(m => m.type === 'posttest');
    
    const orderedList = [];
    if (pretest) orderedList.push(pretest);
    
    chapters.forEach(chapter => {
      orderedList.push(chapter);
      const chapterLessons = lessons
        .filter(l => l.parent_id === chapter.id)
        .sort((a, b) => a.order - b.order);
      orderedList.push(...chapterLessons);
    });
    
    // Add standalone videos (legacy)
    orderedList.push(...videos);
    
    if (posttest) orderedList.push(posttest);
    
    return orderedList;
  };

  useEffect(() => {
    if (classId && profile) {
      fetchData();
    }
  }, [classId, profile]);

  useEffect(() => {
    // Get current materi from URL params
    const urlParams = new URLSearchParams(location.search);
    const materiId = urlParams.get('materi');
    if (materiId && materis.length > 0) {
      const materi = materis.find(m => m.id === materiId);
      if (materi) {
        setCurrentMateri(materi);
      }
    } else if (materis.length > 0) {
      // Default to first incomplete materi in proper order
      const orderedMaterials = getOrderedMaterials();
      const firstIncomplete = orderedMaterials.find(m => !isMateriComplete(m.id));
      setCurrentMateri(firstIncomplete || orderedMaterials[0]);
    }
  }, [location.search, materis, progress]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch class data
      const { data: classInfo, error: classError } = await supabase
        .from('kelas')
        .select('id, judul, deskripsi')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      setClassData(classInfo);

      // Fetch materis for this class
      const { data: materiData, error: materiError } = await supabase
        .from('materi')
        .select('*')
        .eq('kelas_id', classId)
        .order('order', { ascending: true });

      if (materiError) throw materiError;
      setMateris((materiData as Materi[]) || []);

      // Fetch user progress and video links
      const [progressData, videoData] = await Promise.all([
        supabase
          .from('progress')
          .select('*')
          .eq('user_id', profile?.id)
          .in('materi_id', (materiData || []).map(m => m.id)),
        
        supabase
          .from('video_links')
          .select('*')
          .in('materi_id', (materiData || []).filter(m => m.type === 'video' || m.type === 'lesson').map(m => m.id))
          .order('urutan')
      ]);

      if (progressData.error) throw progressData.error;
      if (videoData.error) throw videoData.error;

      setProgress((progressData.data as Progress[]) || []);
      
      // Organize video links by materi_id
      const videoMap = (videoData.data || []).reduce((acc, video) => {
        if (!acc[video.materi_id]) acc[video.materi_id] = [];
        acc[video.materi_id].push(video);
        return acc;
      }, {} as Record<string, VideoLink[]>);
      setVideoLinks(videoMap);

    } catch (error) {
      console.error('Error fetching learning data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembelajaran",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isMateriComplete = (materiId: string): boolean => {
    return progress.some(p => p.materi_id === materiId && p.status === 'complete');
  };

  const canAccessMateri = (materi: Materi): boolean => {
    const orderedMaterials = getOrderedMaterials();
    const materiIndex = orderedMaterials.findIndex(m => m.id === materi.id);
    if (materiIndex === 0) return true; // First materi is always accessible
    
    // Check if previous materi is complete
    const previousMateri = orderedMaterials[materiIndex - 1];
    return previousMateri ? isMateriComplete(previousMateri.id) : false;
  };

  const handleMateriClick = (materi: Materi) => {
    if (!canAccessMateri(materi)) {
      toast({
        title: "Akses Dibatasi",
        description: "Selesaikan step sebelumnya untuk membuka materi ini",
        variant: "destructive"
      });
      return;
    }
    
    if (materi.type === 'lesson') {
      // For lessons, show video list first
      setCurrentMateri(materi);
      setCurrentVideo(null);
      setShowVideoList(true);
    } else {
      // For other types, go directly to the material
      setCurrentMateri(materi);
      setCurrentVideo(null);
      setShowVideoList(false);
    }
    
    // Update URL with materi parameter
    const newUrl = `${location.pathname}?materi=${materi.id}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleVideoClick = (video: VideoLink) => {
    setCurrentVideo(video);
    setShowVideoList(false);
  };

  const handleBackToVideoList = () => {
    setCurrentVideo(null);
    setShowVideoList(true);
  };
  };

  const markMateriComplete = async (materiId: string, skor?: number) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('progress')
        .upsert({
          user_id: profile.id,
          materi_id: materiId,
          status: 'complete',
          skor: skor,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,materi_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Refresh progress data
      await fetchData();
      
      toast({
        title: "Berhasil!",
        description: "Materi telah ditandai selesai",
      });
    } catch (error) {
      console.error('Error marking materi complete:', error);
      toast({
        title: "Error",
        description: "Gagal menandai materi selesai",
        variant: "destructive"
      });
    }
  };

  const getMateriIcon = (type: string) => {
    switch (type) {
      case 'pretest':
        return <HelpCircle className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'posttest':
        return <BookOpen className="h-4 w-4" />;
      case 'chapter':
        return <BookOpen className="h-4 w-4" />;
      case 'lesson':
        return <Play className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getMateriTypeLabel = (type: string) => {
    switch (type) {
      case 'pretest':
        return 'Pre Test';
      case 'video':
        return 'Video Materi';
      case 'posttest':
        return 'Post Test';
      case 'chapter':
        return 'Bab';
      case 'lesson':
        return 'Pelajaran';
      default:
        return type;
    }
  };

  const renderMaterials = () => {
    // Separate materials by type and structure
    const chapters = materis.filter(m => m.type === 'chapter').sort((a, b) => a.order - b.order);
    const lessons = materis.filter(m => m.type === 'lesson');
    const pretest = materis.find(m => m.type === 'pretest');
    const videos = materis.filter(m => m.type === 'video').sort((a, b) => a.order - b.order);
    const posttest = materis.find(m => m.type === 'posttest');

    const renderMaterialItem = (materi: Materi) => {
      const isComplete = isMateriComplete(materi.id);
      const canAccess = canAccessMateri(materi);
      
      return (
        <div
          key={materi.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            currentMateri?.id === materi.id
              ? 'bg-primary/10 border-primary'
              : canAccess
              ? 'hover:bg-muted/50'
              : 'opacity-50'
          }`}
          onClick={() => canAccess && handleMateriClick(materi)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getMateriIcon(materi.type)}
              <div>
                <p className="font-medium text-sm">{materi.judul}</p>
                <p className="text-xs text-muted-foreground">
                  {getMateriTypeLabel(materi.type)}
                </p>
                {materi.deskripsi && (
                  <p className="text-xs text-muted-foreground mt-1">{materi.deskripsi}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!canAccess && <Clock className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </div>
      );
    };

    return (
      <>
        {/* Pre Test */}
        {pretest && renderMaterialItem(pretest)}
        
        {/* Chapters with Lessons */}
        {chapters.map(chapter => {
          const chapterLessons = lessons
            .filter(l => l.parent_id === chapter.id)
            .sort((a, b) => a.order - b.order);
          
          return (
            <div key={chapter.id} className="space-y-2">
              {renderMaterialItem(chapter)}
              {/* Lessons under this chapter */}
              <div className="ml-6 space-y-2">
                {chapterLessons.map(lesson => renderMaterialItem(lesson))}
              </div>
            </div>
          );
        })}
        
        {/* Standalone Videos (legacy) */}
        {videos.map(video => renderMaterialItem(video))}
        
        {/* Post Test */}
        {posttest && renderMaterialItem(posttest)}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Memuat pembelajaran...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Kelas Tidak Ditemukan</h2>
          <Button onClick={() => navigate('/subscriber/classes')}>
            Kembali ke Daftar Kelas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${classData.judul} - Pembelajaran | Pembimbingmu`}
        description={`Pembelajaran interaktif untuk kelas ${classData.judul} dengan Pre Test, Video Materi, dan Post Test`}
        canonical={`https://pembimbingmu.lovable.app/subscriber/learning/${classId}`}
      />
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-muted/30 border-r overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wider">Lesson List</h2>
            </div>

            <div className="space-y-4">
              {/* Assets/Prerequisites */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ASSETS</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Assets Materi Awal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Assets Update Materi</span>
                  </div>
                </div>
              </div>

              {/* Learning Materials */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MATERI PEMBELAJARAN</h3>
                {renderMaterials()}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate('/subscriber/classes')}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Go to Course Home
                </Button>
                <div className="h-6 w-px bg-white/20" />
                <h1 className="font-semibold">
                  {currentMateri ? currentMateri.judul : classData.judul}
                </h1>
              </div>
              {currentMateri && canAccessMateri(currentMateri) && (
                <Button 
                  variant="ghost"
                  size="sm" 
                  className="bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => markMateriComplete(currentMateri.id)}
                >
                  COMPLETE LESSON
                </Button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {currentMateri ? (
              <div className="h-full">
                {currentMateri.type === 'pretest' && (
                  <PreTest 
                    materiId={currentMateri.id}
                    onComplete={(skor) => markMateriComplete(currentMateri.id, skor)}
                  />
                )}
                {/* Video Player for old video type */}
                {currentMateri.type === 'video' && (
                  <VideoPlayer 
                    materi={currentMateri}
                    videoLinks={videoLinks[currentMateri.id] || []}
                    onComplete={() => markMateriComplete(currentMateri.id)}
                  />
                )}
                
                {/* Video List View for Lessons */}
                {currentMateri.type === 'lesson' && showVideoList && (
                  <div className="max-w-4xl mx-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-primary" />
                          {currentMateri.judul}
                        </CardTitle>
                        {currentMateri.deskripsi && (
                          <p className="text-muted-foreground">{currentMateri.deskripsi}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {videoLinks[currentMateri.id]?.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="font-medium mb-4">Pilih Video untuk Ditonton:</h4>
                            {videoLinks[currentMateri.id]
                              .sort((a, b) => a.urutan - b.urutan)
                              .map((video, index) => (
                                <Card 
                                  key={video.id}
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => handleVideoClick(video)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-20 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                                        <img 
                                          src={`https://img.youtube.com/vi/${(() => {
                                            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                                            const match = video.link_youtube.match(regExp);
                                            return match && match[7].length === 11 ? match[7] : '';
                                          })()}/mqdefault.jpg`}
                                          alt={video.judul}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium mb-1">{video.judul}</h5>
                                        <p className="text-sm text-muted-foreground mb-2">Video {index + 1}</p>
                                        {video.deskripsi && (
                                          <p className="text-sm text-muted-foreground line-clamp-2">
                                            {video.deskripsi}
                                          </p>
                                        )}
                                      </div>
                                      <Play className="h-6 w-6 text-primary" />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Belum ada video untuk pelajaran ini</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Video Player for Individual Videos in Lessons */}
                {currentMateri.type === 'lesson' && currentVideo && !showVideoList && (
                  <div className="max-w-6xl mx-auto">
                    <div className="mb-4">
                      <Button 
                        variant="outline" 
                        onClick={handleBackToVideoList}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Video
                      </Button>
                    </div>
                    <VideoPlayer 
                      materi={{
                        ...currentMateri,
                        judul: currentVideo.judul,
                        link_video: currentVideo.link_youtube,
                        thumbnail: currentVideo.thumbnail
                      }}
                      videoLinks={[currentVideo]}
                      onComplete={() => markMateriComplete(currentMateri.id)}
                    />
                  </div>
                )}
                
                {/* Fallback for lessons without video list view */}
                {currentMateri.type === 'lesson' && !showVideoList && !currentVideo && (
                  <VideoPlayer 
                    materi={currentMateri}
                    videoLinks={videoLinks[currentMateri.id] || []}
                    onComplete={() => markMateriComplete(currentMateri.id)}
                  />
                )}
                {currentMateri.type === 'chapter' && (
                  <div className="text-center py-12">
                    <BookOpen className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="text-2xl font-semibold mb-4">{currentMateri.judul}</h3>
                    {currentMateri.deskripsi && (
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{currentMateri.deskripsi}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Pilih pelajaran dari sidebar untuk memulai belajar
                    </p>
                  </div>
                )}
                {currentMateri.type === 'posttest' && (
                  <PostTest 
                    materiId={currentMateri.id}
                    onComplete={(skor) => markMateriComplete(currentMateri.id, skor)}
                  />
                )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Selamat Datang di {classData.judul}</h3>
                <p className="text-muted-foreground mb-4">
                  {classData.deskripsi || 'Pilih materi dari sidebar untuk memulai pembelajaran'}
                </p>
                <Badge variant="outline" className="bg-[#81b59a]/10 text-[#81b59a] border-[#81b59a]/20">
                  Siap untuk Belajar
                </Badge>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}