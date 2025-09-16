import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LearningContent {
  id: string;
  judul: string;
  konten: string;
  urutan: number;
  paket_id: string;
  paket_pembelajaran: {
    nama_paket: string;
  };
}

interface ActivePackage {
  id: string;
  nama_paket: string;
  deskripsi: string;
}

export const Learning = () => {
  const { user } = useAuth();
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [activePackages, setActivePackages] = useState<ActivePackage[]>([]);
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    try {
      // Get active subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscribers')
        .select(`
          paket_pembelajaran (
            id,
            nama_paket,
            deskripsi
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .gt('durasi_akhir', new Date().toISOString());

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        return;
      }

      const packages = subscriptions?.map(s => s.paket_pembelajaran).filter(Boolean) || [];
      setActivePackages(packages);

      if (packages.length === 0) {
        setLoading(false);
        return;
      }

      // Get content for active packages
      const packageIds = packages.map(p => p.id);
      const { data: contentData, error: contentError } = await supabase
        .from('paket_content')
        .select(`
          *,
          paket_pembelajaran (
            nama_paket
          )
        `)
        .in('paket_id', packageIds)
        .order('paket_id')
        .order('urutan');

      if (contentError) {
        console.error('Error fetching content:', contentError);
        return;
      }

      setContents(contentData || []);
      
      // Set first content as selected if available
      if (contentData && contentData.length > 0) {
        setSelectedContent(contentData[0]);
      }

      // Log access
      if (packageIds.length > 0) {
        await supabase.from('akses_log').insert({
          user_id: user?.id,
          paket_id: packageIds[0],
          halaman: 'learning'
        });
      }
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedContents = contents.reduce((acc, content) => {
    const packageName = content.paket_pembelajaran.nama_paket;
    if (!acc[packageName]) {
      acc[packageName] = [];
    }
    acc[packageName].push(content);
    return acc;
  }, {} as Record<string, LearningContent[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activePackages.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pembelajaran</h1>
          <p className="text-muted-foreground">
            Akses materi pembelajaran sesuai paket Anda
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Akses Pembelajaran</h3>
            <p className="text-muted-foreground text-center mb-4">
              Anda tidak memiliki paket pembelajaran yang aktif saat ini.
            </p>
            <p className="text-sm text-muted-foreground">
              Hubungi admin untuk mendapatkan akses paket pembelajaran.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pembelajaran</h1>
        <p className="text-muted-foreground">
          Materi pembelajaran dari paket yang Anda miliki
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content Navigation */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Daftar Materi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedContents).map(([packageName, packageContents]) => (
                <div key={packageName} className="space-y-2">
                  <div className="font-medium text-sm text-primary">
                    {packageName}
                  </div>
                  <div className="space-y-1">
                    {packageContents.map((content) => (
                      <Button
                        key={content.id}
                        variant={selectedContent?.id === content.id ? "default" : "ghost"}
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => setSelectedContent(content)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">{content.urutan}</span>
                          </div>
                          <span className="truncate">{content.judul}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Separator className="my-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Content Display */}
        <div className="lg:col-span-3">
          {selectedContent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{selectedContent.judul}</CardTitle>
                  <Badge variant="outline">
                    {selectedContent.paket_pembelajaran.nama_paket}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {selectedContent.konten ? (
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {selectedContent.konten}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Konten untuk materi ini sedang dalam pengembangan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Materi {selectedContent.urutan} dari {contents.filter(c => c.paket_id === selectedContent.paket_id).length}
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* Previous Button */}
                    {contents.findIndex(c => c.id === selectedContent.id) > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = contents.findIndex(c => c.id === selectedContent.id);
                          setSelectedContent(contents[currentIndex - 1]);
                        }}
                      >
                        Sebelumnya
                      </Button>
                    )}
                    
                    {/* Next Button */}
                    {contents.findIndex(c => c.id === selectedContent.id) < contents.length - 1 && (
                      <Button
                        onClick={() => {
                          const currentIndex = contents.findIndex(c => c.id === selectedContent.id);
                          setSelectedContent(contents[currentIndex + 1]);
                        }}
                      >
                        Selanjutnya
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pilih Materi</h3>
                <p className="text-muted-foreground text-center">
                  Pilih materi dari daftar di samping untuk mulai belajar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};