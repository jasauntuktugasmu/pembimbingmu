import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  materiId: string;
  onSubmit: () => void;
  existingReview?: {
    id: string;
    rating: number;
    student_role: string;
    review_text: string;
  };
}

const studentRoles = [
  'Mahasiswa S1',
  'Mahasiswa S2',
  'Mahasiswa S3',
  'Mahasiswa D3',
  'Mahasiswa D4'
];

export default function ReviewForm({ materiId, onSubmit, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [studentRole, setStudentRole] = useState(existingReview?.student_role || '');
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0 || !studentRole || !reviewText.trim()) {
      toast({
        title: "Error", 
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            student_role: studentRole,
            review_text: reviewText,
          })
          .eq('id', existingReview.id);

        if (error) throw error;

        toast({
          title: "Berhasil!",
          description: "Review berhasil diperbarui",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            materi_id: materiId,
            rating,
            student_role: studentRole,
            review_text: reviewText,
          });

        if (error) throw error;

        toast({
          title: "Berhasil!",
          description: "Review berhasil ditambahkan",
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {existingReview ? 'Edit Review' : 'Berikan Review Anda'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-colors"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Student Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Status Anda</Label>
            <Select value={studentRole} onValueChange={setStudentRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih status anda" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {studentRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Ulasan</Label>
            <Textarea
              id="review"
              placeholder="Ceritakan pengalaman Anda dengan materi ini..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !studentRole || !reviewText.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Menyimpan...' : existingReview ? 'Update Review' : 'Kirim Review'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSubmit}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}