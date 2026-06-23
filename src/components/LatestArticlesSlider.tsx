import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  blog_categories?: { name: string; slug: string } | null;
}

export default function LatestArticlesSlider() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      setArticles((data as any) || []);
      setLoading(false);
    })();
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Artikel Terbaru</h2>
            <p className="text-lg text-gray-600">Tips, panduan, dan insight terbaru seputar akademik & karier.</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-[#81b59a] text-[#81b59a] hover:bg-[#81b59a] hover:text-white transition-colors duration-300 self-start md:self-auto"
          >
            <Link to="/blog">
              Lihat Semua Artikel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: articles.length > 3 }} className="w-full">
            <CarouselContent className="-ml-4">
              {articles.map((a) => (
                <CarouselItem key={a.slug} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Link to={`/blog/${a.slug}`} className="block group h-full">
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 border-gray-200">
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        {a.featured_image ? (
                          <img
                            src={a.featured_image}
                            alt={a.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#81b59a]/20 to-[#81b59a]/5" />
                        )}
                      </div>
                      <CardContent className="p-5 space-y-2">
                        {a.blog_categories && (
                          <Badge variant="secondary" className="text-xs bg-[#81b59a]/10 text-[#81b59a] hover:bg-[#81b59a]/20">
                            {a.blog_categories.name}
                          </Badge>
                        )}
                        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-[#81b59a] transition-colors duration-300">
                          {a.title}
                        </h3>
                        {a.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2">{a.excerpt}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                          {a.published_at && (
                            <span>
                              {new Date(a.published_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          {a.reading_time_minutes ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {a.reading_time_minutes} min
                            </span>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 bg-white border-[#81b59a] text-[#81b59a] hover:bg-[#81b59a] hover:text-white" />
            <CarouselNext className="hidden md:flex -right-4 lg:-right-12 bg-white border-[#81b59a] text-[#81b59a] hover:bg-[#81b59a] hover:text-white" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
