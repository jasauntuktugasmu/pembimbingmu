import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, ExternalLink } from 'lucide-react';

interface Materi {
  id: string;
  judul: string;
  link_video?: string;
  thumbnail?: string;
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

interface VideoPlayerProps {
  materi: Materi;
  videoLinks?: VideoLink[];
  onComplete: () => void;
}

export default function VideoPlayer({ materi, videoLinks, onComplete }: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [videoId, setVideoId] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // If we have video links from the new system, use them
    if (videoLinks && videoLinks.length > 0) {
      const currentVideo = videoLinks[currentVideoIndex];
      if (currentVideo) {
        extractVideoInfo(currentVideo.link_youtube);
        setVideoTitle(currentVideo.judul);
        setVideoDescription(currentVideo.deskripsi || '');
      }
    } else if (materi.link_video) {
      // Fallback to old system
      extractVideoInfo(materi.link_video);
      setVideoTitle(materi.judul);
      setVideoDescription('');
    }
  }, [materi.link_video, videoLinks, currentVideoIndex]);

  const extractVideoInfo = (url: string) => {
    // Extract YouTube video ID from URL
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
      const extractedVideoId = match[7];
      setVideoId(extractedVideoId);
      setThumbnail(`https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg`);
    }
  };

  const handleMarkComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const goToNextVideo = () => {
    if (videoLinks && currentVideoIndex < videoLinks.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const hasVideos = (videoLinks && videoLinks.length > 0) || materi.link_video;

  if (!hasVideos) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Belum Tersedia</h3>
          <p className="text-muted-foreground mb-6">
            Link video untuk materi "{materi.judul}" belum ditambahkan oleh admin.
          </p>
          <Button onClick={onComplete} className="bg-[#81b59a] hover:bg-[#81b59a]/90">
            Lanjutkan ke Materi Berikutnya
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Materi Selesai!</h3>
          <p className="text-muted-foreground">
            Anda telah menyelesaikan video "{materi.judul}". Melanjutkan ke materi berikutnya...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Video Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Video Materi: {materi.judul}
            {videoLinks && videoLinks.length > 1 && (
              <Badge variant="outline" className="ml-2">
                {currentVideoIndex + 1} dari {videoLinks.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-black">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={videoTitle || materi.judul}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <div className="text-center">
                <Play className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Video Player</p>
                <p className="text-muted-foreground">Loading video...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Video Navigation for Multiple Videos */}
      {videoLinks && videoLinks.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {videoLinks.map((video, index) => (
                <div 
                  key={video.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    index === currentVideoIndex 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentVideoIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-black rounded overflow-hidden flex-shrink-0">
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
                      <p className="font-medium text-sm">{video.judul}</p>
                      <p className="text-xs text-muted-foreground">Video {index + 1}</p>
                    </div>
                    {index === currentVideoIndex && (
                      <Badge variant="default">Sedang Diputar</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Info and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3">{videoTitle || materi.judul}</h1>
              
              {videoDescription && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Tentang Video Ini</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {videoDescription}
                  </p>
                </div>
              )}
              
              <p className="text-muted-foreground mb-4">
                {videoDescription ? 
                  "Tonton video pembelajaran di atas sampai selesai, kemudian klik tombol di bawah untuk melanjutkan." :
                  "Tonton video pembelajaran ini sampai selesai, kemudian klik tombol di bawah untuk melanjutkan."
                }
              </p>
              
              {/* Show current video link */}
              {videoLinks && videoLinks.length > 0 && videoLinks[currentVideoIndex] ? (
                <a 
                  href={videoLinks[currentVideoIndex].link_youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka di YouTube
                </a>
              ) : materi.link_video ? (
                <a 
                  href={materi.link_video} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka di YouTube
                </a>
              ) : null}
            </div>
            
            <div className="ml-6">
              <Button 
                onClick={handleMarkComplete}
                className="bg-[#81b59a] hover:bg-[#81b59a]/90"
                size="lg"
              >
                Complete Lesson
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}