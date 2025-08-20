import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";

type ModuleCard = {
  slug: string;
  title: string;
  description: string;
  progress: number;
};

const modules: ModuleCard[] = [
  {
    slug: "bab-1",
    title: "BAB 1: PERSIAPAN AWAL & PENENTUAN TOPIK",
    description: "Mulai dari mindset, manajemen waktu, hingga cara memilih topik yang tepat.",
    progress: 20,
  },
  {
    slug: "bab-2",
    title: "BAB 2: MENYUSUN PROPOSAL PENELITIAN",
    description: "Pelajari anatomi proposal, cara menulis latar belakang, hingga tinjauan pustaka.",
    progress: 10,
  },
  {
    slug: "bab-3",
    title: "BAB 3: METODE PENELITIAN",
    description: "Pahami perbedaan kualitatif & kuantitatif, teknik pengumpulan data, dan penentuan sampel.",
    progress: 0,
  },
  {
    slug: "bab-4",
    title: "BAB 4: ANALISIS DATA & PEMBAHASAN",
    description: "Kuasai teknik analisis data dan cara menulis bab hasil dan pembahasan yang mendalam.",
    progress: 0,
  },
  {
    slug: "bab-5",
    title: "BAB 5: PERSIAPAN SIDANG & PUBLIKASI",
    description: "Tips efektif untuk presentasi sidang, tanya jawab, dan mengubah skripsi menjadi jurnal.",
    progress: 0,
  },
];

export default function LMSDashboard() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "LMS Skripsi - Pembimbingmu",
    "description": "Learning Management System untuk pembelajaran metodologi penelitian, penulisan akademik, dan skill pengembangan diri",
    "provider": {
      "@type": "Organization",
      "name": "Pembimbingmu"
    },
    "courseCode": "LMS-SKRIPSI",
    "hasCourseInstance": modules.map(module => ({
      "@type": "CourseInstance",
      "name": module.title,
      "description": module.description
    }))
  };

  return (
    <>
      <SEO 
        title="LMS Skripsi - Learning Management System | Pembimbingmu"
        description="Learning Management System Pembimbingmu. Akses modul metodologi penelitian, penulisan akademik, presentasi, dan pengembangan diri untuk sukses skripsi."
        canonical="https://pembimbingmu.lovable.app/dashboard/lms"
        jsonLd={structuredData}
      />
      <main className="container mx-auto px-4 py-8">

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">LMS Skripsi: Dashboard Modul</h1>
        <p className="mt-2 text-muted-foreground">Pilih bab untuk mulai belajar.</p>
      </header>

      <section aria-label="Daftar Modul" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.slug} to={`/dashboard/lms/${m.slug}`} aria-label={`Buka ${m.title}`} className="block group">
            <article className="h-full">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{m.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Progres</span>
                      <span className="font-medium text-foreground">{m.progress}%</span>
                    </div>
                    <Progress value={m.progress} />
                  </div>
                </CardContent>
              </Card>
            </article>
          </Link>
        ))}
      </section>
    </main>
    </>
  );
}
