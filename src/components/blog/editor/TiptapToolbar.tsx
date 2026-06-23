import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Quote, Code, Undo, Redo, BookOpen } from "lucide-react";

interface Props {
  editor: Editor | null;
  onInsertImage?: () => void;
  onInsertLink?: () => void;
  onInsertRelated?: () => void;
}

export function TiptapToolbar({ editor, onInsertImage, onInsertLink, onInsertRelated }: Props) {
  if (!editor) return null;
  const chain = () => editor.chain().focus() as any;

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
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => onInsertLink?.()} title="Sisipkan link"><LinkIcon className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => onInsertImage?.()} title="Sisipkan gambar"><ImageIcon className="h-4 w-4" /></Button>

      {onInsertRelated && (
        <Button type="button" size="sm" variant="ghost" className="h-8 px-2 gap-1" onClick={onInsertRelated} title="Sisipkan Baca Juga">
          <BookOpen className="h-4 w-4" /> <span className="text-xs hidden sm:inline">Baca Juga</span>
        </Button>
      )}

      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().undo().run()}><Undo className="h-4 w-4" /></Button>
      <Button type="button" size="sm" variant="ghost" className={btn} onClick={() => chain().redo().run()}><Redo className="h-4 w-4" /></Button>
    </div>
  );
}
