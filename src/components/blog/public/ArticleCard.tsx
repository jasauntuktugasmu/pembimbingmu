import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface Props {
  article: {
    slug: string; title: string; excerpt: string | null; featured_image: string | null;
    published_at: string | null; reading_time_minutes: number | null;
    blog_categories?: { name: string; slug: string } | null;
  };
}

export function ArticleCard({ article }: Props) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <Link to={`/blog/${article.slug}`}>
        {article.featured_image && (
          <img src={article.featured_image} alt={article.title} loading="lazy" className="w-full h-48 object-cover" />
        )}
        <CardContent className="p-4 space-y-2">
          {article.blog_categories && <Badge variant="secondary" className="text-xs">{article.blog_categories.name}</Badge>}
          <h3 className="font-semibold line-clamp-2">{article.title}</h3>
          {article.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.published_at && <span>{new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>}
            {article.reading_time_minutes ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.reading_time_minutes} min</span> : null}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
