import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cropImageCenter, fileToDataUrl, type CropTemplate } from "@/lib/image-crop";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source: File | string | null;
  templates: CropTemplate[];
  defaultTemplateId?: string;
  title?: string;
  /** Called with a cropped Blob (or the original File when template is "original"). */
  onConfirm: (result: { blob: Blob; dataUrl: string; template: CropTemplate; width: number; height: number }) => void | Promise<void>;
}

export function ImageCropDialog({ open, onOpenChange, source, templates, defaultTemplateId, title = "Sesuaikan Gambar", onConfirm }: Props) {
  const [selectedId, setSelectedId] = useState<string>(defaultTemplateId || templates[0]?.id);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [origDataUrl, setOrigDataUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [meta, setMeta] = useState<{ width: number; height: number } | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  const template = templates.find((t) => t.id === selectedId) || templates[0];

  // Load source into data URL when opened
  useEffect(() => {
    if (!open || !source) return;
    (async () => {
      const dataUrl = typeof source === "string" ? source : await fileToDataUrl(source);
      setOrigDataUrl(dataUrl);
      setSelectedId(defaultTemplateId || templates[0]?.id);
    })();
  }, [open, source]); // eslint-disable-line

  // Regenerate preview whenever template changes
  useEffect(() => {
    if (!open || !origDataUrl || !template) return;
    let cancelled = false;
    (async () => {
      setProcessing(true);
      try {
        if (template.aspect === 0) {
          // Original — no crop, derive size from image
          const img = new Image();
          img.src = origDataUrl;
          await new Promise((r) => { img.onload = r; });
          if (cancelled) return;
          setPreviewUrl(origDataUrl);
          setMeta({ width: img.naturalWidth, height: img.naturalHeight });
          setLastBlob(null);
        } else {
          const res = await cropImageCenter(origDataUrl, { aspect: template.aspect, maxWidth: template.maxWidth });
          if (cancelled) return;
          setPreviewUrl(res.dataUrl);
          setMeta({ width: res.width, height: res.height });
          setLastBlob(res.blob);
        }
      } finally {
        if (!cancelled) setProcessing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, origDataUrl, template]);

  const handleConfirm = async () => {
    if (!template || !meta) return;
    setConfirming(true);
    try {
      if (template.aspect === 0) {
        // Use original — fetch the data URL into a blob
        const res = await fetch(origDataUrl);
        const blob = await res.blob();
        await onConfirm({ blob, dataUrl: origDataUrl, template, width: meta.width, height: meta.height });
      } else if (lastBlob) {
        await onConfirm({ blob: lastBlob, dataUrl: previewUrl, template, width: meta.width, height: meta.height });
      }
      onOpenChange(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border bg-muted/20 p-2 flex items-center justify-center min-h-[180px]">
          {processing ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="preview" className="max-h-72 rounded" />
          ) : (
            <span className="text-sm text-muted-foreground">Memuat gambar…</span>
          )}
        </div>

        {meta && (
          <p className="text-xs text-muted-foreground text-center">
            Hasil: <strong className="text-foreground">{meta.width} × {meta.height} px</strong>
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Pilih template potong otomatis</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {templates.map((t) => {
              const active = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`text-left rounded-md border p-2.5 transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50 border-input"}`}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t.recommended}</div>
                </button>
              );
            })}
          </div>
          {template?.hint && <p className="text-xs text-muted-foreground">{template.hint}</p>}
        </div>

        <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Cara kerja:</strong> gambar yang tidak pas dengan rasio template akan otomatis dipotong dari tengah (center crop) tanpa distorsi. Gunakan gambar awal beresolusi tinggi (≥ 1600px sisi terpanjang) untuk hasil terbaik. Format JPG/WebP &lt; 300KB ideal untuk kecepatan halaman.
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>Batal</Button>
          <Button onClick={handleConfirm} disabled={processing || confirming || !meta}>
            {confirming && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Gunakan Gambar Ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
