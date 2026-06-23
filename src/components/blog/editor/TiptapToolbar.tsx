import { useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Undo, Redo, BookOpen, Upload, Link2 } from "lucide-react";

interface Props {
  editor: Editor | null;
  onUploadImage?: (file: File) => Promise<void>;
  onInsertRelated?: () => void;
}

export function TiptapToolbar({ editor, onUploadImage, onInsertRelated }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  if (!editor) return null;
  const chain = () => editor.chain().focus() as any;

  const addLink = () => {
    const url = window.prompt("URL link:");
    if (!url) return;
    chain().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImageUrl = () => {
    const url = window.prompt("URL gambar:");
    if (!url) return;
    const alt = window.prompt("Alt text (penting untuk SEO):") || "";
    chain().setImage({ src: url, alt }).run();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && onUploadImage) await onUploadImage(f);
    if (fileRef.current) fileRef.current.value = "";
  };

  const btn = "h-8 w-8 p-0";
  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/40">
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={addLink}><LinkIcon className="h-4 w-4" /></Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" size="sm" variant="ghost" className={btn}><ImageIcon className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Upload dari komputer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addImageUrl}>
            <Link2 className="h-4 w-4 mr-2" /> Dari URL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {onInsertRelated && (
        <Button type="button" size="sm" variant="ghost" className="h-8 px-2 gap-1" onClick={onInsertRelated} title="Sisipkan Baca Juga">
          <BookOpen className="h-4 w-4" /> <span className="text-xs">Baca Juga</span>
        </Button>
      )}

      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().undo().run()}><Undo className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().redo().run()}><Redo className="h-4 w-4" /></Button>
    </div>
  );
}
