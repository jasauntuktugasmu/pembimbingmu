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
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("blog_tags").select("id,name,slug").order("name");
    if (error) {
      setError(`Gagal memuat tag: ${error.message}`);
      return;
    }
    setItems((data as Tag[]) || []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    setError(null);
    const clean = name.trim();
    if (!clean) {
      setError("Nama tag tidak boleh kosong.");
      return;
    }
    const slug = toSlug(clean);
    if (!slug) {
      setError("Nama tag tidak valid, gunakan huruf atau angka.");
      return;
    }
    if (items.some((t) => t.slug === slug)) {
      setError("Tag dengan nama ini sudah ada.");
      return;
    }

    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("Sesi login berakhir. Silakan muat ulang halaman dan login kembali.");
        return;
      }

      const { error: insertError } = await supabase.from("blog_tags").insert({ name: clean, slug });
      if (insertError) {
        const msg =
          insertError.code === "23505"
            ? "Tag dengan nama/slug ini sudah ada."
            : insertError.code === "42501" || /row-level security|permission denied/i.test(insertError.message)
            ? "Akun Anda tidak punya izin menambah tag. Pastikan login sebagai super admin atau writer."
            : `${insertError.message}${insertError.code ? ` (${insertError.code})` : ""}`;
        setError(msg);
        toast({ title: "Gagal menambah tag", description: msg, variant: "destructive" });
        return;
      }

      setName("");
      await load();
      toast({ title: "Tag ditambahkan", description: clean });
    } catch (e: any) {
      const msg = e?.message || "Terjadi kesalahan tak terduga.";
      setError(msg);
      toast({ title: "Gagal menambah tag", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus tag ini?")) return;
    const { error } = await supabase.from("blog_tags").delete().eq("id", id);
    if (error) {
      setError(`Gagal menghapus tag: ${error.message}`);
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Tag dihapus" });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => { e.preventDefault(); if (!saving) add(); }}
        >
          <Input
            placeholder="Nama tag baru"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
          />
          <Button type="submit" disabled={saving} className="sm:w-auto">
            <Plus className="h-4 w-4 mr-1" /> {saving ? "Menyimpan..." : "Tambah"}
          </Button>
        </form>

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">Belum ada tag.</TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(t.id)} aria-label={`Hapus tag ${t.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
