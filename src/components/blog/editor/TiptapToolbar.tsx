import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Undo, Redo } from "lucide-react";

interface Props {
  editor: Editor | null;
}

export function TiptapToolbar({ editor }: Props) {
  if (!editor) return null;
  const chain = () => editor.chain().focus() as any;

  const addLink = () => {
    const url = window.prompt("URL link:");
    if (!url) return;
    chain().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("URL gambar:");
    const alt = window.prompt("Alt text (penting untuk SEO):") || "";
    if (!url) return;
    chain().setImage({ src: url, alt }).run();
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
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={addImage}><ImageIcon className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().undo().run()}><Undo className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().redo().run()}><Redo className="h-4 w-4" /></Button>
    </div>
  );
}
