import { useParams } from "react-router-dom";
import { ArticleEditor } from "@/components/blog/editor/ArticleEditor";
export default function WriterArticleForm() {
  const { id } = useParams();
  return <ArticleEditor articleId={id} backHref="/writer/articles" />;
}
