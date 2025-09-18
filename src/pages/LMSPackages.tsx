import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  instructor: string;
  description?: string;
  isComingSoon?: boolean;
  subCourses?: Course[];
}

const basicCourses: Course[] = [
  {
    id: 'basic-1',
    title: 'Menentukan Topik Penelitian',
    instructor: 'kak Yahya',
    description: 'Panduan lengkap menentukan topik penelitian yang tepat'
  },
  {
    id: 'basic-2',
    title: 'Menentukan Judul yang baik dan ACC Dosen',
    instructor: 'kak Fadil',
    description: 'Tips dan trik membuat judul yang menarik dan mudah di-ACC'
  },
  {
    id: 'basic-3',
    title: 'Menyusun Latar Belakang dan BAB 1',
    instructor: 'kak Azizah',
    description: 'Penyusunan latar belakang yang kuat dan BAB 1 yang sistematis'
  },
  {
    id: 'basic-4',
    title: 'Fokus Mencari GAP dan Novelty pada BAB 1',
    instructor: 'kak Sasa',
    description: 'Strategi menemukan research gap dan novelty dalam penelitian'
  },
  {
    id: 'basic-5',
    title: 'Dll coming soon',
    instructor: '',
    isComingSoon: true
  }
];

const proCourses: Course[] = [
  ...basicCourses,
  {
    id: 'pro-1',
    title: 'Menentukan Sampel Penelitian',
    instructor: 'Instructor',
    description: 'Metodologi penentuan sampel yang tepat'
  },
  {
    id: 'pro-2',
    title: 'Menentukan Metode Penelitian',
    instructor: 'Instructor',
    description: 'Pemilihan metode penelitian yang sesuai'
  },
  {
    id: 'pro-3',
    title: 'Menentukan Metode Pengumpulan Data',
    instructor: 'Instructor',
    description: 'Teknik pengumpulan data yang efektif'
  },
  {
    id: 'pro-4',
    title: 'Menentukan Metode Olah Data',
    instructor: 'Instructor',
    description: 'Strategi pengolahan data penelitian'
  }
];

const premiumCourses: Course[] = [
  ...proCourses,
  {
    id: 'premium-1',
    title: 'Pembelajaran olah data SPSS',
    instructor: 'Instructor',
    description: 'Analisis data menggunakan SPSS',
    subCourses: [
      { id: 'spss-1', title: 'Golek telo', instructor: 'Instructor' },
      { id: 'spss-2', title: 'Masukkan telo ke panci', instructor: 'Instructor' },
      { id: 'spss-3', title: 'Uji kematangan', instructor: 'Instructor' },
      { id: 'spss-4', title: 'gggg', instructor: 'Instructor' }
    ]
  },
  {
    id: 'premium-2',
    title: 'Olah data Smart PLS',
    instructor: 'Instructor',
    description: 'Analisis structural equation modeling'
  },
  {
    id: 'premium-3',
    title: 'Olah Data Nvivo',
    instructor: 'Instructor',
    description: 'Analisis data kualitatif menggunakan Nvivo'
  },
  {
    id: 'premium-4',
    title: 'Olah data e Views',
    instructor: 'Instructor',
    description: 'Analisis ekonometri dengan e Views'
  },
  {
    id: 'premium-5',
    title: 'Cara menyusun bab 4 pembahasan',
    instructor: 'Instructor',
    description: 'Panduan menyusun pembahasan yang komprehensif'
  },
  {
    id: 'premium-6',
    title: 'Dll coming soon',
    instructor: '',
    isComingSoon: true
  }
];

const CourseCard = ({ course, canEdit = false }: { course: Course; canEdit?: boolean }) => {
  const navigate = useNavigate();
  
  const handleStartLearning = () => {
    if (course.subCourses && course.subCourses.length > 0) {
      // Navigate to course detail with subcourses
      navigate(`/lms/course/${course.id}`);
    } else {
      // Navigate to single lesson
      navigate(`/lms/lesson/${course.id}`);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight">
            {course.title}
          </CardTitle>
          {canEdit && !course.isComingSoon && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {course.instructor && (
          <p className="text-sm text-muted-foreground">
            Pengajar: {course.instructor}
          </p>
        )}
        {course.isComingSoon && (
          <Badge variant="secondary" className="w-fit">
            Coming Soon
          </Badge>
        )}
      </CardHeader>
      
      {course.description && (
        <CardContent className="pt-0 flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {course.description}
          </p>
          {course.subCourses && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {course.subCourses.length} sub-materi
              </p>
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="pt-3">
        {course.isComingSoon ? (
          <Button disabled className="w-full" variant="secondary">
            Coming Soon
          </Button>
        ) : (
          <Button 
            onClick={handleStartLearning}
            className="w-full" 
            style={{ backgroundColor: '#81b59a' }}
          >
            <Play className="h-4 w-4 mr-2" />
            Mulai Belajar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function LMSPackages() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'superadmin';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "LMS Packages - Pembimbingmu",
    "description": "Paket pembelajaran komprehensif untuk metodologi penelitian dan penulisan skripsi",
    "provider": {
      "@type": "Organization",
      "name": "Pembimbingmu"
    }
  };

  return (
    <>
      <SEO 
        title="LMS Packages - Paket Pembelajaran | Pembimbingmu"
        description="Pilih paket pembelajaran yang sesuai kebutuhan Anda: Basic, Pro, atau Premium dengan materi lengkap metodologi penelitian dan analisis data."
        canonical="https://pembimbingmu.lovable.app/lms/packages"
        jsonLd={structuredData}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              LMS Packages
            </h1>
            <p className="text-muted-foreground">
              Pilih paket pembelajaran yang sesuai dengan kebutuhan Anda
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic" className="text-base">Basic</TabsTrigger>
            <TabsTrigger value="pro" className="text-base">Pro</TabsTrigger>
            <TabsTrigger value="premium" className="text-base">Premium</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Basic</h2>
                <p className="text-muted-foreground">
                  Fondasi dasar untuk memulai penelitian dan skripsi Anda
                </p>
              </div>
              {isAdmin && (
                <Button className="bg-[#81b59a] hover:bg-[#6fa085]">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {basicCourses.map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pro" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Pro</h2>
                <p className="text-muted-foreground">
                  Semua materi Basic + metodologi penelitian lanjutan
                </p>
              </div>
              {isAdmin && (
                <Button className="bg-[#81b59a] hover:bg-[#6fa085]">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proCourses.map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Paket Premium</h2>
                <p className="text-muted-foreground">
                  Paket lengkap dengan analisis data dan pembahasan mendalam
                </p>
              </div>
              {isAdmin && (
                <Button className="bg-[#81b59a] hover:bg-[#6fa085]">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kelas
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumCourses.map((course) => (
                <CourseCard key={course.id} course={course} canEdit={isAdmin} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}