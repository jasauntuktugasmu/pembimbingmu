import { useParams } from "react-router-dom";
import { ArticleEditor } from "@/components/blog/editor/ArticleEditor";

export default function AdminBlogArticleForm() {
  const { id } = useParams();
  return <ArticleEditor articleId={id} backHref="/admin/blog/articles" />;
}
