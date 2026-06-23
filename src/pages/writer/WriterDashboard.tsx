import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, TrendingUp, FileEdit } from "lucide-react";

export default function WriterDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, views: 0, avgSeo: 0 });

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from("blog_articles").select("status,views_count,seo_score").eq("author_id", profile.id);
      if (!data) return;
      const total = data.length;
      const published = data.filter((d) => d.status === "published").length;
      const draft = data.filter((d) => d.status === "draft").length;
      const views = data.reduce((s, d) => s + (d.views_count || 0), 0);
      const avgSeo = total ? Math.round(data.reduce((s, d) => s + (d.seo_score || 0), 0) / total) : 0;
      setStats({ total, published, draft, views, avgSeo });
    })();
  }, [profile]);

  const cards = [
    { label: "Total Artikel", value: stats.total, icon: FileText },
    { label: "Published", value: stats.published, icon: FileEdit },
    { label: "Total Views", value: stats.views, icon: Eye },
    { label: "Avg SEO", value: stats.avgSeo, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Selamat datang, {profile?.full_name || "Writer"}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}><CardContent className="p-4 flex items-center gap-3"><c.icon className="h-8 w-8 text-primary" /><div><div className="text-xs text-muted-foreground">{c.label}</div><div className="text-2xl font-bold">{c.value}</div></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
