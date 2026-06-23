import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toSlug } from "@/lib/seo-utils";
import { useToast } from "@/hooks/use-toast";

interface Category { id: string; name: string; slug: string; description: string | null; seo_title: string | null; meta_description: string | null; }

export default function AdminBlogCategories() {
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", seo_title: "", meta_description: "" });

  const load = async () => {
    const { data } = await supabase.from("blog_categories").select("*").order("name");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", slug: "", description: "", seo_title: "", meta_description: "" }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || "", seo_title: c.seo_title || "", meta_description: c.meta_description || "" }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, slug: form.slug || toSlug(form.name) };
    const { error } = editing
      ? await supabase.from("blog_categories").update(payload).eq("id", editing.id)
      : await supabase.from("blog_categories").insert(payload);
    if (error) { toast({ title: "Gagal", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Tersimpan" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    await supabase.from("blog_categories").delete().eq("id", id);
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kategori Artikel</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Kategori</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || toSlug(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })} /></div>
              <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>SEO Title</Label><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></div>
              <div><Label>Meta Description</Label><Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></div>
              <Button className="w-full" onClick={save}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-muted-foreground">/{c.slug}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
