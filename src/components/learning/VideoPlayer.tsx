import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, ExternalLink } from 'lucide-react';

interface Materi {
  id: string;
  judul: string;
  link_video?: string;
  thumbnail?: string;
}

interface VideoPlayerProps {
  materi: Materi;
  onComplete: () => void;
}

export default function VideoPlayer({ materi, onComplete }: VideoPlayerProps) {
  const [videoId, setVideoId] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (materi.link_video) {
      extractVideoInfo(materi.link_video);
    }
  }, [materi.link_video]);

  const extractVideoInfo = (url: string) => {
    // Extract YouTube video ID from URL
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
      const extractedVideoId = match[7];
      setVideoId(extractedVideoId);
      setThumbnail(`https://img.youtube.com/vi/${extractedVideoId}/maxresdefault.jpg`);
      
      // Try to fetch video title (this would require YouTube API key in production)
      // For now, we'll use the materi title
      setVideoTitle(materi.judul);
    }
  };

  const handleMarkComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (!materi.link_video) {
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

      {/* Video Info and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{videoTitle || materi.judul}</h3>
              <p className="text-muted-foreground mb-4">
                Tonton video pembelajaran ini sampai selesai, kemudian klik "Complete Lesson" untuk melanjutkan ke materi berikutnya.
              </p>
              
              {materi.link_video && (
                <a 
                  href={materi.link_video} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka di YouTube
                </a>
              )}
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

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Catatan Pembelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>Tonton video dengan seksama dan catat poin-poin penting</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>Jika ada yang kurang jelas, Anda bisa memutar ulang video</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p>Setelah selesai menonton, klik "Complete Lesson" untuk melanjutkan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}