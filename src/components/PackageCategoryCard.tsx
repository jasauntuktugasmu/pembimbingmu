import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditPackageModal from '@/components/admin/EditPackageModal';
import { Play } from 'lucide-react';

interface Package {
  id: string;
  nama_paket: string;
  deskripsi?: string;
  harga?: number;
  durasi_hari: number;
  background_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  button_text?: string;
  category_link?: string;
  icon_url?: string;
  thumbnail_url?: string;
}

interface PackageCategoryCardProps {
  package: Package;
  courseCount: number;
  onUpdate: () => void;
}

export default function PackageCategoryCard({ package: pkg, courseCount, onUpdate }: PackageCategoryCardProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'superadmin';

  const gradientStyle = {
    background: `linear-gradient(135deg, ${pkg.gradient_from || '#f97316'}, ${pkg.gradient_to || '#fb923c'})`,
  };

  const handleClick = () => {
    if (pkg.category_link) {
      navigate(pkg.category_link);
    } else {
      // Default navigation to courses within this package
      navigate(`/lms/packages/${pkg.id}`);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer transition-transform hover:scale-105 group min-h-[280px] flex flex-col"
      onClick={isAdmin ? undefined : handleClick}
      style={gradientStyle}
    >
      {/* Background Image Overlay */}
      {pkg.thumbnail_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${pkg.thumbnail_url})` }}
        />
      )}
      
      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditPackageModal package={pkg} onUpdate={onUpdate} />
        </div>
      )}

      <div className="relative z-10 p-6 flex flex-col flex-1 text-white">
        {/* Icon */}
        {pkg.icon_url && (
          <div className="mb-4">
            <img 
              src={pkg.icon_url} 
              alt={`${pkg.nama_paket} icon`}
              className="w-12 h-12 object-contain"
            />
          </div>
        )}

        {/* Package Title */}
        <h3 className="text-2xl font-bold mb-3 leading-tight">
          {pkg.nama_paket}
        </h3>

        {/* Package Description */}
        {pkg.deskripsi && (
          <p className="text-white/90 mb-4 flex-1 leading-relaxed">
            {pkg.deskripsi}
          </p>
        )}

        {/* Course Count */}
        <div className="mb-4">
          <span className="text-white/80 text-sm">
            {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
          </span>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Button
            onClick={handleButtonClick}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm font-medium"
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            {pkg.button_text || 'Mulai Kelas'}
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
    </Card>
  );
}