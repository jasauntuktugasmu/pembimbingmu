import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";
import { CONTENT_TEMPLATES, cropImageCenter, blobToFile, fileToDataUrl } from "@/lib/image-crop";

export interface ImageInsertValue {
  src: string;
  alt: string;
  width: string | null; // "300px" | "100%" | null
  align: "left" | "center" | "right";
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpload: (file: File) => Promise<string | null>;
  onInsert: (v: ImageInsertValue) => void;
}

const SIZE_PRESETS = [
  { id: "small", label: "Kecil", value: "300px", hint: "Ikon / diagram kecil" },
  { id: "medium", label: "Sedang", value: "600px", hint: "Default — paling pas untuk konten" },
  { id: "large", label: "Besar", value: "900px", hint: "Screenshot / ilustrasi penting" },
  { id: "full", label: "Penuh", value: "100%", hint: "Full-width artikel" },
  { id: "custom", label: "Custom", value: "", hint: "Tentukan piksel sendiri" },
] as const;

export function ImageInsertDialog({ open, onOpenChange, onUpload, onInsert }: Props) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [sizeId, setSizeId] = useState<string>("medium");
  const [customPx, setCustomPx] = useState<string>("500");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSrc(""); setAlt(""); setSizeId("medium"); setCustomPx("500");
      setAlign("center"); setTab("upload"); setUploading(false);
    }
  }, [open]);

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await onUpload(file);
    setUploading(false);
    if (url) setSrc(url);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const getWidth = (): string | null => {
    const preset = SIZE_PRESETS.find((p) => p.id === sizeId);
    if (!preset) return null;
    if (preset.id === "custom") {
      const n = parseInt(customPx, 10);
      return Number.isFinite(n) && n > 0 ? `${n}px` : null;
    }
    return preset.value || null;
  };

  const handleInsert = () => {
    if (!src || !alt.trim()) return;
    onInsert({ src, alt: alt.trim(), width: getWidth(), align });
    onOpenChange(false);
  };

  const canInsert = !!src && !!alt.trim() && !uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sisipkan Gambar</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">Dari URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 sm:p-10 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:bg-muted/30"}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-sm">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Mengunggah...
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-7 w-7" />
                  <span><span className="text-foreground font-medium">Klik untuk pilih file</span> atau drag &amp; drop di sini</span>
                  <span className="text-xs">PNG, JPG, WebP — max 5MB</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-3 space-y-2">
            <Label>URL Gambar</Label>
            <Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://..." />
          </TabsContent>
        </Tabs>

        {src && (
          <div className="rounded-md border p-2 bg-muted/20">
            <img src={src} alt="" className="max-h-48 mx-auto rounded" />
            <button type="button" onClick={() => setSrc("")} className="text-xs text-muted-foreground hover:text-destructive mt-2 mx-auto flex items-center gap-1">
              <X className="h-3 w-3" /> Hapus
            </button>
          </div>
        )}

        <div className="space-y-2">
          <Label>Alt text <span className="text-destructive">*</span></Label>
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Deskripsi singkat gambar" />
          <p className="text-xs text-muted-foreground">Wajib diisi — penting untuk SEO &amp; aksesibilitas.</p>
        </div>

        <div className="space-y-2">
          <Label>Ukuran tampilan</Label>
          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSizeId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${sizeId === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-input"}`}
              >
                {p.label}{p.value ? ` · ${p.value}` : ""}
              </button>
            ))}
          </div>
          {sizeId === "custom" && (
            <div className="flex items-center gap-2 pt-1">
              <Input type="number" min={50} max={2000} value={customPx} onChange={(e) => setCustomPx(e.target.value)} className="w-32" />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{SIZE_PRESETS.find((p) => p.id === sizeId)?.hint}</p>
        </div>

        <div className="space-y-2">
          <Label>Perataan</Label>
          <div className="inline-flex rounded-md border overflow-hidden">
            {([
              { v: "left", icon: AlignLeft },
              { v: "center", icon: AlignCenter },
              { v: "right", icon: AlignRight },
            ] as const).map(({ v, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setAlign(v)}
                className={`p-2 ${align === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                aria-label={v}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Rekomendasi:</strong> rasio 16:9 atau 4:3, maks lebar 1600px,
          format JPG/WebP dengan ukuran file di bawah 300KB untuk performa terbaik.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleInsert} disabled={!canInsert}>Sisipkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
