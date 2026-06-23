import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialUrl?: string;
  initialNewTab?: boolean;
  onSubmit: (url: string, newTab: boolean) => void;
  onRemove?: () => void;
}

export function LinkInsertDialog({ open, onOpenChange, initialUrl = "", initialNewTab = true, onSubmit, onRemove }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [newTab, setNewTab] = useState(initialNewTab);

  useEffect(() => {
    if (open) { setUrl(initialUrl); setNewTab(initialNewTab); }
  }, [open, initialUrl, initialNewTab]);

  const handleSubmit = () => {
    let final = url.trim();
    if (!final) return;
    if (!/^https?:\/\//i.test(final) && !final.startsWith("/") && !final.startsWith("mailto:")) {
      final = `https://${final}`;
    }
    onSubmit(final, newTab);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>{initialUrl ? "Edit Link" : "Sisipkan Link"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>URL</Label>
            <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://contoh.com" onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={newTab} onCheckedChange={(v) => setNewTab(!!v)} />
            Buka di tab baru
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
          {initialUrl && onRemove && (
            <Button variant="destructive" onClick={() => { onRemove(); onOpenChange(false); }} className="sm:mr-auto">Hapus Link</Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!url.trim()}>{initialUrl ? "Update" : "Sisipkan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
