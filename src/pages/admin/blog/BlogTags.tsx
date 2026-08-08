import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toSlug } from "@/lib/seo-utils";
import { useToast } from "@/hooks/use-toast";

interface Tag { id: string; name: string; slug: string; }

export default function AdminBlogTags() {
  const { toast } = useToast();
  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("blog_tags").select("*").order("name");
    if (error) toast({ title: "Gagal memuat tag", description: error.message, variant: "destructive" });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const clean = name.trim();
    if (!clean) return;
    const slug = toSlug(clean);
    if (!slug) { toast({ title: "Nama tag tidak valid", variant: "destructive" }); return; }
    if (items.some((t) => t.slug === slug)) { toast({ title: "Tag sudah ada", variant: "destructive" }); return; }
    setSaving(true);
    const { data, error } = await supabase.from("blog_tags").insert({ name: clean, slug }).select().single();
    setSaving(false);
    if (error) {
      toast({
        title: "Gagal menambah tag",
        description: error.code === "23505" ? "Tag dengan nama/slug ini sudah ada." : `${error.message} (${error.code ?? "-"})`,
        variant: "destructive",
      });
      return;
    }
    setName("");
    setItems((prev) => [...prev, data as Tag].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ title: "Tag ditambahkan" });
  };
  const remove = async (id: string) => {
    if (!confirm("Hapus tag?")) return;
    const { error } = await supabase.from("blog_tags").delete().eq("id", id);
    if (error) { toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" }); return; }
    setItems((prev) => prev.filter((t) => t.id !== id));
  };


  return (
    <Card>
      <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Nama tag baru" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
