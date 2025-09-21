import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, BookOpen, Trophy, Star, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ReviewForm from './ReviewForm';

interface Soal {
  id: string;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
  jawaban_benar: string;
}

interface PostTestProps {
  materiId: string;
  onComplete: (skor: number) => void;
}

export default function PostTest({ materiId, onComplete }: PostTestProps) {
  const [soals, setSoals] = useState<Soal[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSoals();
    if (user) {
      checkExistingReview();
    }
  }, [materiId, user]);

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
        description: "Gagal memuat soal Post Test",
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
    }, 3000);

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

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: 'Luar Biasa!', description: 'Pemahaman Anda sangat excellent!', icon: Trophy };
    if (score >= 80) return { message: 'Sangat Baik!', description: 'Anda memahami materi dengan baik!', icon: CheckCircle };
    if (score >= 70) return { message: 'Baik!', description: 'Pemahaman Anda sudah cukup baik.', icon: CheckCircle };
    return { message: 'Perlu Ditingkatkan', description: 'Silakan review kembali materi sebelumnya.', icon: XCircle };
  };

  const checkExistingReview = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('materi_id', materiId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing review:', error);
        return;
      }

      if (data) {
        setExistingReview(data);
        setHasReviewed(true);
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    setHasReviewed(true);
    checkExistingReview(); // Refresh review data
    toast({
      title: "Terima kasih!",
      description: "Review Anda telah disimpan",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Memuat soal Post Test...</div>
      </div>
    );
  }

  if (soals.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Post Test Belum Tersedia</h3>
          <p className="text-muted-foreground mb-6">
            Soal Post Test untuk materi ini belum dibuat oleh admin.
          </p>
          <Button onClick={() => onComplete(100)} className="bg-[#81b59a] hover:bg-[#81b59a]/90">
            Selesaikan Pembelajaran
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showReviewForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Review Pembelajaran</CardTitle>
          </CardHeader>
        </Card>
        <ReviewForm 
          materiId={materiId}
          onSubmit={handleReviewSubmit}
          existingReview={existingReview}
        />
      </div>
    );
  }

  if (showResults) {
    const scoreInfo = getScoreMessage(score);
    const ScoreIcon = scoreInfo.icon;
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <ScoreIcon className={`h-16 w-16 mx-auto mb-4 ${
              score >= 70 ? 'text-green-500' : 'text-red-500'
            }`} />
            <h3 className="text-2xl font-bold mb-2">{scoreInfo.message}</h3>
            <p className="text-lg mb-2">Skor Anda: <span className="font-bold text-primary">{score}/100</span></p>
            <p className="text-muted-foreground mb-4">{scoreInfo.description}</p>
            
            {score >= 90 && (
              <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                <Trophy className="h-4 w-4" />
                Perfect Score Achievement!
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Progress value={score} className="w-full" />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Ringkasan Hasil:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Jawaban Benar:</span>
                  <div className="font-semibold text-green-600">
                    {Math.round((score / 100) * soals.length)} dari {soals.length}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Akurasi:</span>
                  <div className="font-semibold">{score}%</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {score >= 70 
                ? 'Selamat! Anda telah menyelesaikan pembelajaran ini.'
                : 'Jangan berkecil hati. Terus belajar dan berlatih!'
              }
            </p>

            {/* Review Buttons */}
            <div className="pt-4 border-t mt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Berikan Review Anda
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  variant={hasReviewed ? "outline" : "default"}
                  className="flex-1 sm:flex-none"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {hasReviewed ? 'Edit Review' : 'Tulis Review'}
                </Button>
                <Button 
                  onClick={() => onComplete(score)}
                  className="flex-1 bg-[#81b59a] hover:bg-[#81b59a]/90"
                >
                  {hasReviewed ? 'Selesai' : 'Lewati & Selesai'}
                </Button>
              </div>
            </div>
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
              <BookOpen className="h-5 w-5 text-primary" />
              Post Test - Evaluasi Pembelajaran
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
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              Soal {currentQuestion + 1}
            </span>
            <h3 className="text-lg font-semibold">{currentSoal.pertanyaan}</h3>
          </div>
          
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
              <div key={option.key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value={option.key} id={`${currentSoal.id}-${option.key}`} className="mt-0.5" />
                <Label 
                  htmlFor={`${currentSoal.id}-${option.key}`} 
                  className="flex-1 cursor-pointer leading-relaxed"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold mr-3">
                    {option.key.toUpperCase()}
                  </span>
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
              className={`w-3 h-3 rounded-full transition-colors ${
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
            {submitting ? 'Memproses...' : 'Selesaikan Test'}
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