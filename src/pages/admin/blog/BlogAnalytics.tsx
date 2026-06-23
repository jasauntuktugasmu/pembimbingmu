import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, TrendingUp, CheckCircle } from "lucide-react";

interface Stats {
  total: number; published: number; draft: number; archived: number;
  totalViews: number; avgSeo: number;
}

export default function BlogAnalytics() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, archived: 0, totalViews: 0, avgSeo: 0 });
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [topAuthors, setTopAuthors] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: arts } = await supabase.from("blog_articles").select("id,title,status,views_count,seo_score,author_id, profiles!blog_articles_author_id_fkey(full_name)");
      if (arts) {
        const total = arts.length;
        const published = arts.filter((a) => a.status === "published").length;
        const draft = arts.filter((a) => a.status === "draft").length;
        const archived = arts.filter((a) => a.status === "archived").length;
        const totalViews = arts.reduce((sum, a) => sum + (a.views_count || 0), 0);
        const avgSeo = total ? Math.round(arts.reduce((s, a) => s + (a.seo_score || 0), 0) / total) : 0;
        setStats({ total, published, draft, archived, totalViews, avgSeo });
        setTopArticles([...arts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10));

        const byAuthor: Record<string, { name: string; views: number; count: number }> = {};
        arts.forEach((a: any) => {
          const k = a.author_id;
          if (!byAuthor[k]) byAuthor[k] = { name: a.profiles?.full_name || "Unknown", views: 0, count: 0 };
          byAuthor[k].views += a.views_count || 0;
          byAuthor[k].count += 1;
        });
        setTopAuthors(Object.values(byAuthor).sort((a, b) => b.views - a.views).slice(0, 5));
      }
    })();
  }, []);

  const cards = [
    { label: "Total Artikel", value: stats.total, icon: FileText },
    { label: "Published", value: stats.published, icon: CheckCircle },
    { label: "Total Views", value: stats.totalViews, icon: Eye },
    { label: "Avg SEO Score", value: stats.avgSeo, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className="h-8 w-8 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-2xl font-bold">{c.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Top 10 Most Viewed</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-1 text-sm">
              {topArticles.map((a, i) => (
                <li key={a.id} className="flex justify-between gap-2"><span className="truncate">{i + 1}. {a.title}</span><span className="text-muted-foreground shrink-0">{a.views_count}</span></li>
              ))}
              {topArticles.length === 0 && <li className="text-muted-foreground">Belum ada data</li>}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Authors</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-1 text-sm">
              {topAuthors.map((a, i) => (
                <li key={i} className="flex justify-between gap-2"><span>{i + 1}. {a.name}</span><span className="text-muted-foreground">{a.views} views · {a.count} artikel</span></li>
              ))}
              {topAuthors.length === 0 && <li className="text-muted-foreground">Belum ada data</li>}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
