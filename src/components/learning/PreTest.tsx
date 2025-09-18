import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Soal {
  id: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: string;
}

interface PreTestProps {
  materiId: string;
  onComplete: (skor: number) => void;
}

export default function PreTest({ materiId, onComplete }: PreTestProps) {
  const [soals, setSoals] = useState<Soal[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSoals();
  }, [materiId]);

  const fetchSoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('soal')
        .select('*')
        .eq('materi_id', materiId)
        .order('created_at');

      if (error) throw error;
      setSoals(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat soal Pre Test",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (soals.length === 0) return 0;
    
    let correct = 0;
    soals.forEach(soal => {
      if (answers[soal.id] === soal.jawaban_benar) {
        correct++;
      }
    });
    
    return Math.round((correct / soals.length) * 100);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < soals.length) {
      toast({
        title: "Belum Lengkap",
        description: "Mohon jawab semua soal sebelum submit",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    // Auto complete after showing results
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);

    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < soals.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Memuat soal Pre Test...</div>
      </div>
    );
  }

  if (soals.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Pre Test Belum Tersedia</h3>
          <p className="text-muted-foreground mb-6">
            Soal Pre Test untuk materi ini belum dibuat oleh admin.
          </p>
          <Button onClick={() => onComplete(0)} className="bg-[#81b59a] hover:bg-[#81b59a]/90">
            Lanjutkan ke Materi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            {score >= 70 ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold mb-2">
              {score >= 70 ? 'Selamat!' : 'Perlu Ditingkatkan'}
            </h3>
            <p className="text-lg mb-2">Skor Anda: <span className="font-bold text-primary">{score}/100</span></p>
            <p className="text-muted-foreground">
              {score >= 70 
                ? 'Anda berhasil menyelesaikan Pre Test dengan baik!' 
                : 'Jangan khawatir, lanjutkan ke materi untuk belajar lebih lanjut.'
              }
            </p>
          </div>
          
          <div className="space-y-3">
            <Progress value={score} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Memproses hasil dan melanjutkan ke materi...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSoal = soals[currentQuestion];
  const progress = ((currentQuestion + 1) / soals.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Pre Test
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Soal {currentQuestion + 1} dari {soals.length}
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-lg font-semibold mb-6">{currentSoal.pertanyaan}</h3>
          
          <RadioGroup 
            value={answers[currentSoal.id] || ''} 
            onValueChange={(value) => handleAnswerChange(currentSoal.id, value)}
            className="space-y-4"
          >
            {[
              { key: 'a', text: currentSoal.pilihan_a },
              { key: 'b', text: currentSoal.pilihan_b },
              { key: 'c', text: currentSoal.pilihan_c },
              { key: 'd', text: currentSoal.pilihan_d }
            ].map((option) => (
              <div key={option.key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={option.key} id={`${currentSoal.id}-${option.key}`} className="mt-0.5" />
                <Label 
                  htmlFor={`${currentSoal.id}-${option.key}`} 
                  className="flex-1 cursor-pointer leading-relaxed"
                >
                  <span className="font-medium mr-2">{option.key.toUpperCase()}.</span>
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          Sebelumnya
        </Button>
        
        <div className="flex items-center gap-2">
          {soals.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? 'bg-primary'
                  : answers[soals[index].id]
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {currentQuestion === soals.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < soals.length}
            className="bg-[#81b59a] hover:bg-[#81b59a]/90"
          >
            {submitting ? 'Memproses...' : 'Submit Test'}
          </Button>
        ) : (
          <Button 
            onClick={nextQuestion}
            disabled={!answers[currentSoal.id]}
            className="bg-[#81b59a] hover:bg-[#81b59a]/90"
          >
            Selanjutnya
          </Button>
        )}
      </div>
    </div>
  );
}