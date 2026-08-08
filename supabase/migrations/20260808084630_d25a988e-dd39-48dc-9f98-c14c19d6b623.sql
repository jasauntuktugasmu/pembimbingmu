GRANT SELECT ON public.blog_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;

GRANT SELECT ON public.blog_article_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_article_tags TO authenticated;
GRANT ALL ON public.blog_article_tags TO service_role;