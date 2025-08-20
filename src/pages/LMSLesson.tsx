import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, PlayCircle } from "lucide-react";
import SEO from "@/components/SEO";

type Lesson = {
  type: "video" | "download" | "quiz";
  title: string;
  videoId?: string;
};

type Module = {
  slug: string;
  title: string;
  lessons: Lesson[];
};

const MODULES: Module[] = [
  {
    slug: "bab-1",
    title: "Bab 1: Persiapan Awal & Penentuan Topik",
    lessons: [
      { type: "video", title: "[Video] Mindset & Manajemen Waktu Mengerjakan Skripsi", videoId: "ysz5S6PUM-U" },
      { type: "video", title: "[Video] Cara Mencari dan Memilih Topik yang Tepat", videoId: "2V-20Qe4M8Y" },
      { type: "video", title: "[Video] Teknik Menghindari Topik Plagiat", videoId: "g7kThkQ9l9Y" },
      { type: "download", title: "[Download] Daftar Contoh Judul Skripsi Berdasarkan Jurusan" },
      { type: "quiz", title: "[Kuis] Pemahaman Dasar Penelitian" },
    ],
  },
  { slug: "bab-2", title: "Bab 2: Menyusun Proposal Penelitian", lessons: [] },
  { slug: "bab-3", title: "Bab 3: Metode Penelitian", lessons: [] },
  { slug: "bab-4", title: "Bab 4: Analisis Data & Pembahasan", lessons: [] },
  { slug: "bab-5", title: "Bab 5: Persiapan Sidang & Publikasi", lessons: [] },
];

export default function LMSLesson() {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();

  const module = useMemo(() => MODULES.find((m) => m.slug === moduleId) || MODULES[0], [moduleId]);
  const initialIndex = Math.max(0, Number(searchParams.get("lesson")) || 0);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const lesson = module.lessons[activeIndex];
  const completedUntil = Math.max(0, activeIndex - 1);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": module.title,
    "description": `Pembelajaran ${module.title} melalui video pembelajaran interaktif dan materi downloadable`,
    "provider": {
      "@type": "Organization", 
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.com"
    },
    "courseCode": moduleId,
    "numberOfCredits": module.lessons.length,
    "hasCourseInstance": [{
      "@type": "CourseInstance",
      "courseMode": "online",
      "instructor": {
        "@type": "Organization",
        "name": "Pembimbingmu"
      }
    }]
  };

  return (
    <>
      <SEO 
        title={`${module.title} - LMS Skripsi | Pembimbingmu`}
        description={`Pelajari ${module.title} melalui video pembelajaran interaktif, materi download, dan kuis. Tingkatkan skill akademik untuk sukses skripsi.`}
        canonical={`https://pembimbingmu.com/dashboard/lms/${moduleId}`}
        jsonLd={structuredData}
      />
      <main className="container mx-auto px-4 py-6">

      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{module.title}</h1>
        <Link to="/dashboard/lms" className="text-sm text-primary hover:underline">Kembali ke Dashboard</Link>
      </header>

      <section className="flex flex-col gap-6 md:flex-row">
        {/* Left: Playlist */}
        <aside className="md:w-1/3 lg:w-[30%]">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Daftar Pelajaran</h2>
              </div>
              <nav aria-label="Daftar pelajaran" className="divide-y">
                {module.lessons.map((l, i) => {
                  const isActive = i === activeIndex;
                  const isCompleted = i <= completedUntil;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                      aria-current={isActive}
                    >
                      <span className="shrink-0">
                        {l.type === "video" ? (
                          <PlayCircle className="h-5 w-5" />
                        ) : isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <span className="inline-block h-5 w-5 rounded-full border border-border" />
                        )}
                      </span>
                      <span className="text-sm font-medium leading-snug">{l.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Right: Content Viewer */}
        <section className="md:w-2/3 lg:w-[70%] space-y-4">
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              {lesson?.type === "video" && lesson.videoId ? (
                <div>
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={`https://www.youtube.com/embed/${lesson.videoId}`}
                      title={lesson.title}
                      className="h-full w-full rounded-md"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </AspectRatio>
                </div>
              ) : lesson?.type === "download" ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Konten unduhan akan tersedia di kelas. Sementara ini, silakan lanjut ke pelajaran berikutnya.
                </div>
              ) : lesson?.type === "quiz" ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Kuis interaktif akan hadir segera.
                </div>
              ) : null}

              <div>
                <h2 className="text-xl font-semibold">{lesson?.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tulis catatan singkat Anda terkait pelajaran ini di bawah.
                </p>
                <textarea
                  className="mt-3 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Catatan saya..."
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
    </>
  );
}
