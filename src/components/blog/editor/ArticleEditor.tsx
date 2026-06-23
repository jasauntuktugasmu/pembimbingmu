import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TiptapToolbar } from "./TiptapToolbar";
import { SeoAnalysisPanel } from "./SeoAnalysisPanel";
import { RelatedArticlePickerDialog } from "./RelatedArticlePickerDialog";
import { BacaJugaNode, type BacaJugaItem } from "./extensions/BacaJugaNode";
import { analyzeSeo, toSlug } from "@/lib/seo-utils";
import { Loader2, Upload, X } from "lucide-react";

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; slug: string; }

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  content_html: string;
  featured_image: string;
  thumbnail_seo: string;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_image: string;
  robots_meta: string;
  canonical_url: string;
}

const empty: ArticleData = {
  title: "", slug: "", excerpt: "", content: null, content_html: "",
  featured_image: "", thumbnail_seo: "", category_id: null, status: "draft",
  seo_title: "", meta_description: "", focus_keyword: "", meta_keywords: "",
  og_title: "", og_description: "", og_image: "", twitter_image: "",
  robots_meta: "index,follow", canonical_url: "",
};

interface Props {
  articleId?: string;
  backHref: string;
}

export function ArticleEditor({ articleId, backHref }: Props) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<ArticleData>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [relatedPickerOpen, setRelatedPickerOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<{ url: string; newTab: boolean }>({ url: "", newTab: true });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: (el) => (el as HTMLElement).style.width || (el as HTMLElement).getAttribute("width") || null,
              renderHTML: (attrs: any) => (attrs.width ? { style: `width:${attrs.width}; height:auto;` } : {}),
            },
            "data-align": {
              default: "center",
              parseHTML: (el) => (el as HTMLElement).getAttribute("data-align") || "center",
              renderHTML: (attrs: any) => ({ "data-align": attrs["data-align"] || "center" }),
            },
          };
        },
      }).configure({ HTMLAttributes: { class: "rounded-lg max-w-full h-auto" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Mulai tulis artikelmu di sini..." }),
      BacaJugaNode,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setData((d) => ({ ...d, content: editor.getJSON(), content_html: editor.getHTML() }));
    },
  });

  const handleInsertImage = (v: { src: string; alt: string; width: string | null; align: "left" | "center" | "right" }) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: v.src, alt: v.alt, ...(v.width ? { width: v.width } : {}), "data-align": v.align } as any).run();
  };

  const openLinkDialog = () => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setCurrentLink({ url: attrs.href || "", newTab: attrs.target === "_blank" });
    setLinkDialogOpen(true);
  };

  const handleSubmitLink = (url: string, newTab: boolean) => {
    if (!editor) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    chain.setLink({ href: url, target: newTab ? "_blank" : null, rel: newTab ? "noopener noreferrer nofollow" : null } as any).run();
  };

  const handleRemoveLink = () => editor?.chain().focus().extendMarkRange("link").unsetLink().run();

  const handleInsertRelated = (items: BacaJugaItem[]) => {
    editor?.chain().focus().insertBacaJuga(items).run();
  };

  // Load article + meta data
  useEffect(() => {
    (async () => {
      const [catRes, tagRes] = await Promise.all([
        supabase.from("blog_categories").select("id,name").order("name"),
        supabase.from("blog_tags").select("id,name,slug").order("name"),
      ]);
      setCategories(catRes.data || []);
      setTags(tagRes.data || []);

      if (articleId) {
        setLoading(true);
        const { data: art } = await supabase.from("blog_articles").select("*").eq("id", articleId).single();
        if (art) {
          setData({
            id: art.id, title: art.title, slug: art.slug, excerpt: art.excerpt || "",
            content: art.content, content_html: art.content_html || "",
            featured_image: art.featured_image || "", thumbnail_seo: art.thumbnail_seo || "",
            category_id: art.category_id, status: art.status as any,
            seo_title: art.seo_title || "", meta_description: art.meta_description || "",
            focus_keyword: art.focus_keyword || "", meta_keywords: art.meta_keywords || "",
            og_title: art.og_title || "", og_description: art.og_description || "",
            og_image: art.og_image || "", twitter_image: art.twitter_image || "",
            robots_meta: art.robots_meta || "index,follow", canonical_url: art.canonical_url || "",
          });
          editor?.commands.setContent(art.content_html || "");
          const { data: artTags } = await supabase.from("blog_article_tags").select("tag_id").eq("article_id", articleId);
          setSelectedTags(artTags?.map((t) => t.tag_id) || []);
        }
        setLoading(false);
      }
    })();
  }, [articleId, editor]);

  // Auto slug from title (only if user hasn't typed slug yet)
  useEffect(() => {
    if (!articleId && data.title && !data.slug) {
      setData((d) => ({ ...d, slug: toSlug(d.title) }));
    }
  }, [data.title, articleId, data.slug]);

  const seoResult = useMemo(() => analyzeSeo({
    title: data.title, slug: data.slug, seo_title: data.seo_title,
    meta_description: data.meta_description, focus_keyword: data.focus_keyword,
    content_html: data.content_html, excerpt: data.excerpt, featured_image: data.featured_image,
  }), [data]);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `blog/${profile?.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("package-images").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "Upload gagal", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: pub } = supabase.storage.from("package-images").getPublicUrl(path);
    return pub.publicUrl;
  };

  const onFeaturedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeatured(true);
    const url = await uploadImage(file);
    setUploadingFeatured(false);
    if (url) setData((d) => ({ ...d, featured_image: url }));
  };

  const handleCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    const slug = toSlug(name);
    const { data: created, error } = await supabase.from("blog_tags").insert({ name, slug }).select().single();
    if (error) { toast({ title: "Gagal", description: error.message, variant: "destructive" }); return; }
    setTags((t) => [...t, created]);
    setSelectedTags((s) => [...s, created.id]);
    setNewTag("");
  };

  const handleSave = async (newStatus?: ArticleData["status"]) => {
    if (!profile) return;
    if (!data.title || !data.slug) { toast({ title: "Judul & slug wajib diisi", variant: "destructive" }); return; }
    setSaving(true);

    const payload: any = {
      title: data.title, slug: data.slug, excerpt: data.excerpt,
      content: data.content, content_html: data.content_html,
      featured_image: data.featured_image || null, thumbnail_seo: data.thumbnail_seo || null,
      category_id: data.category_id, status: newStatus || data.status,
      seo_title: data.seo_title || null, meta_description: data.meta_description || null,
      focus_keyword: data.focus_keyword || null, meta_keywords: data.meta_keywords || null,
      og_title: data.og_title || null, og_description: data.og_description || null,
      og_image: data.og_image || null, twitter_image: data.twitter_image || null,
      robots_meta: data.robots_meta, canonical_url: data.canonical_url || null,
      seo_score: seoResult.score, author_id: profile.id,
    };

    let savedId = articleId;
    if (articleId) {
      const { error } = await supabase.from("blog_articles").update(payload).eq("id", articleId);
      if (error) { toast({ title: "Gagal simpan", description: error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { data: created, error } = await supabase.from("blog_articles").insert(payload).select("id").single();
      if (error) { toast({ title: "Gagal simpan", description: error.message, variant: "destructive" }); setSaving(false); return; }
      savedId = created.id;
    }

    // Sync tags
    if (savedId) {
      await supabase.from("blog_article_tags").delete().eq("article_id", savedId);
      if (selectedTags.length) {
        await supabase.from("blog_article_tags").insert(selectedTags.map((tag_id) => ({ article_id: savedId, tag_id })));
      }
    }

    toast({ title: "Berhasil disimpan" });
    setSaving(false);
    navigate(backHref);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Judul Artikel *</Label>
              <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="text-lg font-semibold" />
            </div>
            <div>
              <Label>Slug URL *</Label>
              <Input value={data.slug} onChange={(e) => setData({ ...data, slug: toSlug(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">/blog/{data.slug || "..."}</p>
            </div>
            <div>
              <Label>Ringkasan (Excerpt)</Label>
              <Textarea value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Konten Artikel</CardTitle></CardHeader>
          <CardContent className="p-0">
            <TiptapToolbar editor={editor} onUploadImage={handleInlineImageUpload} onInsertRelated={() => setRelatedPickerOpen(true)} />
            <div className="article-editor-content rounded-b-md border-t bg-background px-6 py-5 min-h-[560px] focus-within:outline-none">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>

        <RelatedArticlePickerDialog
          open={relatedPickerOpen}
          onOpenChange={setRelatedPickerOpen}
          excludeId={articleId}
          onInsert={handleInsertRelated}
        />

        <Card>
          <CardHeader><CardTitle className="text-base">Pengaturan SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>SEO Title</Label>
              <Input value={data.seo_title} onChange={(e) => setData({ ...data, seo_title: e.target.value })} maxLength={70} />
              <p className="text-xs text-muted-foreground mt-1">{data.seo_title.length}/60 karakter</p>
            </div>
            <div>
              <Label>Meta Description</Label>
              <Textarea value={data.meta_description} onChange={(e) => setData({ ...data, meta_description: e.target.value })} rows={2} maxLength={170} />
              <p className="text-xs text-muted-foreground mt-1">{data.meta_description.length}/160 karakter</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Focus Keyword</Label>
                <Input value={data.focus_keyword} onChange={(e) => setData({ ...data, focus_keyword: e.target.value })} />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input value={data.meta_keywords} onChange={(e) => setData({ ...data, meta_keywords: e.target.value })} placeholder="koma, pisah, kata" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>OG Title</Label>
                <Input value={data.og_title} onChange={(e) => setData({ ...data, og_title: e.target.value })} />
              </div>
              <div>
                <Label>OG Image URL</Label>
                <Input value={data.og_image} onChange={(e) => setData({ ...data, og_image: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>OG Description</Label>
              <Textarea value={data.og_description} onChange={(e) => setData({ ...data, og_description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Twitter Image</Label>
                <Input value={data.twitter_image} onChange={(e) => setData({ ...data, twitter_image: e.target.value })} />
              </div>
              <div>
                <Label>Robots Meta</Label>
                <Select value={data.robots_meta} onValueChange={(v) => setData({ ...data, robots_meta: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">index, follow</SelectItem>
                    <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                    <SelectItem value="index,nofollow">index, nofollow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Canonical URL</Label>
              <Input value={data.canonical_url} onChange={(e) => setData({ ...data, canonical_url: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Publikasi</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Status</Label>
              <Select value={data.status} onValueChange={(v: any) => setData({ ...data, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => handleSave()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Simpan
            </Button>
            {data.status !== "published" && (
              <Button variant="default" className="w-full" onClick={() => handleSave("published")} disabled={saving}>
                Publish Sekarang
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate(backHref)}>Batal</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Featured Image</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.featured_image && (
              <div className="relative">
                <img src={data.featured_image} alt="featured" className="w-full rounded" />
                <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => setData({ ...data, featured_image: "" })}><X className="h-3 w-3" /></Button>
              </div>
            )}
            <Label className="flex items-center justify-center gap-2 border-2 border-dashed rounded p-4 cursor-pointer hover:bg-muted">
              {uploadingFeatured ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              <span className="text-sm">{uploadingFeatured ? "Mengunggah..." : "Upload gambar"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFeaturedChange} />
            </Label>
            <div>
              <Label className="text-xs">Atau URL Featured Image</Label>
              <Input value={data.featured_image} onChange={(e) => setData({ ...data, featured_image: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Thumbnail SEO URL</Label>
              <Input value={data.thumbnail_seo} onChange={(e) => setData({ ...data, thumbnail_seo: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Kategori & Tags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Kategori</Label>
              <Select value={data.category_id || ""} onValueChange={(v) => setData({ ...data, category_id: v || null })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
                {selectedTags.map((id) => {
                  const tag = tags.find((t) => t.id === id);
                  if (!tag) return null;
                  return <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setSelectedTags(selectedTags.filter((s) => s !== id))}>{tag.name} <X className="h-3 w-3 ml-1" /></Badge>;
                })}
              </div>
              <Select value="" onValueChange={(v) => { if (v && !selectedTags.includes(v)) setSelectedTags([...selectedTags, v]); }}>
                <SelectTrigger><SelectValue placeholder="Tambah tag" /></SelectTrigger>
                <SelectContent>
                  {tags.filter((t) => !selectedTags.includes(t.id)).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Buat tag baru..." value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                <Button type="button" variant="outline" onClick={handleCreateTag}>+</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">SEO Analysis</CardTitle></CardHeader>
          <CardContent><SeoAnalysisPanel result={seoResult} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
