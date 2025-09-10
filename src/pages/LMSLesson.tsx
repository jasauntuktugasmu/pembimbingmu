import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';

export default function LMSLesson() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "LMS Skripsi",
    "description": "Learning Management System untuk Skripsi akan segera hadir dengan pembelajaran interaktif dan materi downloadable",
    "provider": {
      "@type": "Organization", 
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  return (
    <>
      <SEO 
        title="LMS Skripsi - Coming Soon | Pembimbingmu"
        description="LMS Skripsi akan segera hadir dengan pembelajaran interaktif, materi download, dan kuis untuk kesuksesan skripsi Anda."
        canonical="https://pembimbingmu.lovable.app/dashboard/lms"
        jsonLd={structuredData}
      />
      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LMS Skripsi
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🚧 Coming Soon</h2>
            <p className="text-lg">
              Learning Management System untuk Skripsi sedang dalam tahap pengembangan dan akan segera hadir!
            </p>
            <p className="mt-4 text-sm">
              Nantikan pembelajaran interaktif, video tutorial, materi download, dan kuis untuk kesuksesan skripsi Anda.
            </p>
          </div>
          <div className="mt-6">
            <Link 
              to="/dashboard" 
              className="text-[#81b59a] hover:underline"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}