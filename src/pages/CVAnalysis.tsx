import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type AnalysisState = 'upload' | 'analyzing' | 'results';

interface AnalysisResults {
  analisis_inti: {
    overall_score: number;
    recommendation: string;
    overall_summary: string;
    feedback_positif: string;
    feedback_area_of_improvement: string;
  };
  level_kekuatan: string;
  saran_perfeksionis: string;
  prediksi_interview: string;
  rekomendasi_video1: string;
  rekomendasi_video2: string;
  rekomendasi_video3: string;
}

const loadingSteps = [
  '⏳ Membaca & menstrukturkan CV Anda',
  '⚙️ Menganalisis kecocokan dengan lowongan',
  '📊 Menghitung skor & menentukan level',
  '🔮 Membuat prediksi pertanyaan interview',
  '✍️ Merumuskan saran perfeksionis',
  '🎬 Mencari playlist YouTube relevan',
  '📄 Merakit laporan final...'
];

export default function CVAnalysis() {
  const [state, setState] = useState<AnalysisState>('upload');
  const [cvId, setCvId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://n8n.srv930432.hstgr.cloud/webhook/uploadcv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setCvId(data.namespace_id);
      setState('analyzing');
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Gagal mengunggah CV. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const startAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Silakan masukkan deskripsi pekerjaan.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(0);

    // Start progressive loading animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 30000);

    try {
      const response = await fetch('https://n8n.srv930432.hstgr.cloud/webhook/analisiscv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace_id: cvId,
          jobDescription: jobDescription
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
      setState('results');
      
      // Animate cards appearance
      setTimeout(() => {
        const revealCards = () => {
          setVisibleCards(prev => {
            if (prev < 5) {
              setTimeout(revealCards, 200);
              return prev + 1;
            }
            return prev;
          });
        };
        revealCards();
      }, 100);

    } catch (error) {
      clearInterval(stepInterval);
      toast({
        title: "Analysis Error",
        description: "Analisis Gagal. Terjadi kesalahan saat menghubungi server. Silakan coba beberapa saat lagi.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };

  const ScoreGauge = ({ score }: { score: number }) => (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${(score / 100) * 314} 314`}
          className="text-[#81b59a] transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-sm text-gray-500">/100</div>
        </div>
      </div>
    </div>
  );

  if (state === 'upload') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analisis CV Terbaikmu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unggah CV Anda untuk mendapatkan analisis mendalam berbasis AI, skor ATS, 
            prediksi pertanyaan interview, dan rekomendasi belajar.
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#81b59a] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Button
                disabled={isUploading}
                className="bg-[#81b59a] hover:bg-[#6fa085]"
              >
                {isUploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Memproses CV Anda...
                  </>
                ) : (
                  'Klik untuk Mengunggah CV (PDF/DOCX)'
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 animate-fade-in">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              CV berhasil diproses!
            </div>
          </div>
        )}

        {!isAnalyzing ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Langkah Terakhir: Tambahkan Deskripsi Pekerjaan
              </h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Tempel seluruh deskripsi pekerjaan dari lowongan yang Anda incar di sini..."
                  className="min-h-[200px] mb-4"
                />
                <Button
                  onClick={startAnalysis}
                  className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white font-medium"
                  disabled={!jobDescription.trim()}
                >
                  Analisis Sekarang!
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              AI sedang bekerja untuk Anda...
            </h2>
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {loadingSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {index <= currentStep ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={index <= currentStep ? 'text-green-700' : 'text-gray-500'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (state === 'results' && results && results.analisis_inti) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <Card className={`transition-all duration-500 ${visibleCards >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardHeader className="text-center">
            <CardTitle>Skor & Level CV Anda</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ScoreGauge score={results.analisis_inti?.overall_score || 0} />
            <p className="text-xl font-bold mt-4">
              Level Kekuatan CV: {results.level_kekuatan || 'Tidak tersedia'}
            </p>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className={`transition-all duration-500 delay-200 ${visibleCards >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardHeader>
            <CardTitle>Ringkasan Analisis</CardTitle>
            <Badge className="w-fit">{results.analisis_inti?.recommendation || 'Tidak tersedia'}</Badge>
          </CardHeader>
          <CardContent>
            <div className={expandedSummary ? '' : 'line-clamp-3'}>
              {renderMarkdown(results.analisis_inti?.overall_summary || 'Ringkasan tidak tersedia')}
            </div>
            {(results.analisis_inti?.overall_summary || '').split('\n').length > 3 && (
              <Button
                variant="link"
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="p-0 h-auto text-[#81b59a]"
              >
                {expandedSummary ? 'Tutup' : '...Baca Selengkapnya'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Feedback Card */}
        <Card className={`transition-all duration-500 delay-400 ${visibleCards >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  👍 Kekuatan Anda
                </h3>
                <div className="prose prose-sm">
                  {renderMarkdown(results.analisis_inti?.feedback_positif || 'Feedback tidak tersedia')}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  🔍 Area Peningkatan
                </h3>
                <div className="prose prose-sm">
                  {renderMarkdown(results.analisis_inti?.feedback_area_of_improvement || 'Feedback tidak tersedia')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Insights Card */}
        <Card className={`transition-all duration-500 delay-600 ${visibleCards >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardHeader>
            <CardTitle>Wawasan yang Dapat Ditindaklanjuti</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="saran" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="saran">Saran Perfeksionis</TabsTrigger>
                <TabsTrigger value="interview">Prediksi Interview</TabsTrigger>
              </TabsList>
              <TabsContent value="saran" className="mt-6">
                <div className="prose prose-sm">
                  {renderMarkdown(results.saran_perfeksionis || 'Saran tidak tersedia')}
                </div>
              </TabsContent>
              <TabsContent value="interview" className="mt-6">
                <div className="prose prose-sm">
                  {renderMarkdown(results.prediksi_interview || 'Prediksi tidak tersedia')}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Playlist Card */}
        <Card className={`transition-all duration-500 delay-800 ${visibleCards >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardHeader>
            <CardTitle>Rekomendasi Playlist Belajar Untukmu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[results.rekomendasi_video1, results.rekomendasi_video2, results.rekomendasi_video3].filter(Boolean).map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-48 bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
                >
                  <div className="w-full h-24 bg-red-500 rounded mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-medium">Playlist {index + 1}</p>
                  <p className="text-xs text-gray-600">YouTube Learning</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}