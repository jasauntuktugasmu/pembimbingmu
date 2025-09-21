import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';

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

interface TestimonialCarouselProps {
  limit?: number;
}

export default function TestimonialCarousel({ limit = 6 }: TestimonialCarouselProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

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

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Fetch profiles for each user_id
      const userIds = [...new Set(reviewsData.map(review => review.user_id))];
      if (userIds.length > 0) {
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
      } else {
        setReviews(reviewsData.map(review => ({ ...review, profiles: null })));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Apa Kata Klien Kami?</h2>
            <p className="text-lg text-gray-600">Testimoni dari mahasiswa yang telah berhasil lulus</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Apa Kata Klien Kami?</h2>
            <p className="text-lg text-gray-600">Testimoni dari mahasiswa yang telah berhasil lulus</p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada review tersedia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Apa Kata Klien Kami?</h2>
          <p className="text-lg text-gray-600">Testimoni dari mahasiswa yang telah berhasil lulus</p>
        </div>
        
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="bg-white shadow-lg hover:bg-gray-50 rounded-full w-12 h-12"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="bg-white shadow-lg hover:bg-gray-50 rounded-full w-12 h-12"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0">
                  <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Stars */}
                      {renderStars(review.rating)}
                      
                      {/* Review Text */}
                      <p className="text-gray-700 mb-6 italic flex-grow leading-relaxed">
                        "{review.review_text}"
                      </p>
                      
                      {/* User Info */}
                      <div className="flex items-center mt-auto">
                        <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {review.profiles?.full_name || 'Pengguna'}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {review.student_role}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="text-xs text-gray-500 mt-3">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-8 md:hidden">
            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
                  onClick={() => emblaApi && emblaApi.scrollTo(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}