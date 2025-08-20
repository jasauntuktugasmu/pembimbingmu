import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';

const carouselImages = [
  "/lovable-uploads/059db273-4d94-449f-a0c2-0239dda77753.png",
  "/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png",
];

export default function Login() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLogin = () => {
    // Simulate login and redirect to dashboard
    navigate('/dashboard');
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.lovable.app/login",
    "name": "Login - Pembimbingmu",
    "description": "Masuk ke akun Pembimbingmu untuk mengakses layanan bimbingan skripsi terbaik",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  return (
    <>
      <SEO 
        title="Login - Masuk ke Akun Pembimbingmu | Platform Bimbingan Skripsi"
        description="Masuk ke akun Pembimbingmu untuk mengakses layanan bimbingan skripsi, analisis CV, dan konsultasi akademik dengan mentor berpengalaman."
        canonical="https://pembimbingmu.lovable.app/login"
        jsonLd={structuredData}
      />
      <div className="min-h-screen bg-gray-50">
      {/* Image Carousel Section */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Carousel ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Login Card Section */}
      <div className="flex justify-center items-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Masuk ke Akun Anda
            </CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              Silakan masuk menggunakan akun Google dengan email yang Anda gunakan saat melakukan pembelian.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-[#81b59a] hover:bg-[#6fa085] text-white font-medium text-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login dengan Google
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-6 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
            <span>© 2025 Pembimbingmu. All Rights Reserved.</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#81b59a] transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="hover:text-[#81b59a] transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}