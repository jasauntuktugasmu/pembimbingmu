import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string; title: string; slug: string; status: string;
  views_count: number; seo_score: number; published_at: string | null;
  author_id: string; author?: { full_name: string | null };
}

interface Props {
  scope: "admin" | "writer";
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function BlogArticlesList({ scope }: Props) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);


  const base = scope === "admin" ? "/admin/blog" : "/writer";
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const load = async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let q = supabase
      .from("blog_articles")
      .select(
        "id,title,slug,status,views_count,seo_score,published_at,author_id, profiles!blog_articles_author_id_fkey(full_name)",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false });
    if (scope === "writer" && profile) q = q.eq("author_id", profile.id);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (search) q = q.ilike("title", `%${search}%`);
    const { data, count } = await q.range(from, to);
    setArticles((data as any) || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  // Reset to page 1 when filters/pageSize change
  useEffect(() => { setPage(1); }, [statusFilter, search, pageSize]);

  useEffect(() => { if (profile) load(); /* eslint-disable-next-line */ }, [profile, statusFilter, search, page, pageSize]);



  const handleDelete = async (id: string) => {
    if (!confirm("Hapus artikel ini?")) return;
    const { error } = await supabase.from("blog_articles").delete().eq("id", id);
    if (error) toast({ title: "Gagal", description: error.message, variant: "destructive" });
    else { toast({ title: "Artikel dihapus" }); load(); }
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("blog_articles").update({ status }).eq("id", id);
    if (error) toast({ title: "Gagal", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{scope === "admin" ? "Semua Artikel" : "Artikel Saya"}</CardTitle>
          <Button asChild><Link to={`${base}/articles/new`}><Plus className="h-4 w-4 mr-1" /> Artikel Baru</Link></Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Input placeholder="Cari judul..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8 text-muted-foreground">Loading...</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                {scope === "admin" && <TableHead>Author</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>SEO</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  {scope === "admin" && <TableCell>{(a as any).profiles?.full_name || "-"}</TableCell>}
                  <TableCell><Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                  <TableCell><span className={a.seo_score >= 80 ? "text-green-600" : a.seo_score >= 50 ? "text-yellow-600" : "text-red-500"}>{a.seo_score}</span></TableCell>
                  <TableCell>{a.views_count}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {a.status === "published" && <Button size="icon" variant="ghost" asChild><a href={`/blog/${a.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}
                    {a.status !== "published" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "published")}>Publish</Button>}
                    {a.status === "published" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "draft")}>Unpublish</Button>}
                    <Button size="icon" variant="ghost" asChild><Link to={`${base}/articles/${a.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {articles.length === 0 && <TableRow><TableCell colSpan={scope === "admin" ? 6 : 5} className="text-center py-8 text-muted-foreground">Belum ada artikel</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}

        {!loading && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} dari {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <span>Per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-wrap justify-center">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Sebelumnya
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
                    <Button size="sm" variant={p === page ? "default" : "outline"} onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  </span>
                ))}
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

  );
}
