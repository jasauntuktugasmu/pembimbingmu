import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  student_role: string;
  review_text: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface ReviewDisplayProps {
  limit?: number;
  showTitle?: boolean;
}

export default function ReviewDisplay({ limit, showTitle = true }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [limit]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          id,
          rating,
          student_role,
          review_text,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: reviewsData, error } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      if (!reviewsData) {
        setReviews([]);
        return;
      }

      // Fetch profiles for each user_id
      const userIds = [...new Set(reviewsData.map(review => review.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const reviewsWithProfiles = reviewsData.map(review => ({
        ...review,
        profiles: profilesMap.get(review.user_id) || null
      }));

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h3 className="text-xl font-semibold text-center">Testimoni Pengguna</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        {showTitle && (
          <h3 className="text-xl font-semibold mb-4">Testimoni Pengguna</h3>
        )}
        <p className="text-muted-foreground">Belum ada review tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <h3 className="text-2xl font-bold text-center">Testimoni Pengguna</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <User className="w-8 h-8 p-1 bg-primary/10 text-primary rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {review.profiles?.full_name || 'Pengguna'}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {review.student_role}
                  </Badge>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm text-muted-foreground">
                  ({review.rating}/5)
                </span>
              </div>

              {/* Review Text */}
              <p className="text-sm leading-relaxed text-foreground">
                "{review.review_text}"
              </p>

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}