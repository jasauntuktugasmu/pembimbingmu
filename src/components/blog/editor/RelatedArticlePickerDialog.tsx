import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { BacaJugaItem } from "./extensions/BacaJugaNode";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  excludeId?: string;
  onInsert: (items: BacaJugaItem[]) => void;
}

const MAX = 5;

export function RelatedArticlePickerDialog({ open, onOpenChange, excludeId, onInsert }: Props) {
  const [q, setQ] = useState("");
  const [articles, setArticles] = useState<BacaJugaItem[]>([]);
  const [selected, setSelected] = useState<Record<string, BacaJugaItem>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      let query = supabase
        .from("blog_articles")
        .select("id,title,slug,featured_image,excerpt")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);
      if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
      const { data } = await query;
      const items = (data || [])
        .filter((a: any) => a.id !== excludeId)
        .map((a: any) => ({ id: a.id, title: a.title, slug: a.slug, image: a.featured_image, excerpt: a.excerpt }));
      setArticles(items);
      setLoading(false);
    })();
  }, [open, q, excludeId]);

  useEffect(() => { if (!open) setSelected({}); }, [open]);

  const toggle = (item: BacaJugaItem) => {
    setSelected((s) => {
      const next = { ...s };
      if (next[item.id]) delete next[item.id];
      else if (Object.keys(next).length < MAX) next[item.id] = item;
      return next;
    });
  };

  const handleInsert = () => {
    const items = Object.values(selected);
    if (!items.length) return;
    onInsert(items);
    onOpenChange(false);
  };

  const count = Object.keys(selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sisipkan "Baca Juga"</DialogTitle>
        </DialogHeader>
        <Input placeholder="Cari artikel..." value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="text-xs text-muted-foreground">Pilih hingga {MAX} artikel — {count}/{MAX} dipilih</p>
        <ScrollArea className="h-80 border rounded-md">
          {loading ? (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin h-5 w-5" /></div>
          ) : articles.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">Tidak ada artikel</p>
          ) : (
            <ul className="divide-y">
              {articles.map((a) => {
                const checked = !!selected[a.id];
                const disabled = !checked && count >= MAX;
                return (
                  <li key={a.id} className={`flex gap-3 p-3 ${disabled ? "opacity-50" : "hover:bg-muted/40 cursor-pointer"}`} onClick={() => !disabled && toggle(a)}>
                    <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => !disabled && toggle(a)} />
                    {a.image && <img src={a.image} alt="" className="w-14 h-14 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{a.title}</p>
                      {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleInsert} disabled={count === 0}>Sisipkan ({count})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
