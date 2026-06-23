import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Writer { id: string; full_name: string | null; email: string | null; }

export default function ManageWriters() {
  const { toast } = useToast();
  const [items, setItems] = useState<Writer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [resetTarget, setResetTarget] = useState<Writer | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const load = async () => {
    const { data } = await supabase.from("profiles").select("id,full_name,email").eq("role", "writer");
    setItems((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.full_name || !form.email || form.password.length < 6) {
      toast({ title: "Lengkapi semua field (password min 6)", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("create-writer", { body: form });
    setSaving(false);
    if (error || data?.error) {
      toast({ title: "Gagal", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Writer berhasil dibuat" });
    setForm({ full_name: "", email: "", password: "" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus writer ini? Semua artikelnya juga akan dihapus.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast({ title: "Gagal", description: error.message, variant: "destructive" });
    else load();
  };

  const resetPassword = async () => {
    if (!resetTarget || newPassword.length < 6) return;
    const { data, error } = await supabase.functions.invoke("reset-writer-password", { body: { user_id: resetTarget.id, new_password: newPassword } });
    if (error || data?.error) toast({ title: "Gagal", description: error?.message || data?.error, variant: "destructive" });
    else { toast({ title: "Password direset" }); setResetTarget(null); setNewPassword(""); }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Management Writer</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Tambah Writer</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Writer Baru</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nama Lengkap</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Password (min 6)</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <Button className="w-full" onClick={create} disabled={saving}>{saving ? "Membuat..." : "Buat Akun Writer"}</Button>
                <p className="text-xs text-muted-foreground">Akun langsung aktif tanpa verifikasi email.</p>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.full_name || "-"}</TableCell>
                  <TableCell>{w.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => { setResetTarget(w); setNewPassword(""); }}><KeyRound className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Belum ada writer</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Reset password untuk: <b>{resetTarget?.email}</b></p>
            <div><Label>Password Baru (min 6)</Label><Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <Button className="w-full" onClick={resetPassword}>Reset</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
