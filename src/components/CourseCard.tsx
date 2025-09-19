import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  duration?: string;
  originalPrice?: number;
  currentPrice?: number;
  level?: string;
  buttonText?: string;
  onEnroll?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  rating = 4.5,
  reviewCount = 0,
  studentCount = 0,
  duration = "0h 0m",
  originalPrice,
  currentPrice,
  level = "All Levels",
  buttonText = "Daftar Kelas",
  onEnroll
}) => {
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll();
    } else {
      navigate(`/lms/packages`);
    }
  };

  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-card border border-border">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
        {level && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 bg-background/90 text-foreground border border-border/50"
          >
            {level}
          </Badge>
        )}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-primary/30">{title.charAt(0)}</div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(rating)}
          </div>
          <span className="text-sm font-medium text-foreground">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{studentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {originalPrice && currentPrice && originalPrice > currentPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            {currentPrice && (
              <span className="text-lg font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
            )}
            {!currentPrice && !originalPrice && (
              <span className="text-lg font-bold text-primary">
                Gratis
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleEnrollClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};