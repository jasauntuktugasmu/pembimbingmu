GRANT SELECT ON public.blog_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;

GRANT SELECT ON public.blog_article_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_article_tags TO authenticated;
GRANT ALL ON public.blog_article_tags TO service_role;

DROP POLICY IF EXISTS "Superadmin updates tags" ON public.blog_tags;
DROP POLICY IF EXISTS "Superadmin deletes tags" ON public.blog_tags;
DROP POLICY IF EXISTS "Authed can create tags" ON public.blog_tags;

CREATE POLICY "Superadmin or writer create tags" ON public.blog_tags
  FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin() OR public.is_writer());

CREATE POLICY "Superadmin or writer update tags" ON public.blog_tags
  FOR UPDATE TO authenticated
  USING (public.is_superadmin() OR public.is_writer())
  WITH CHECK (public.is_superadmin() OR public.is_writer());

CREATE POLICY "Superadmin or writer delete tags" ON public.blog_tags
  FOR DELETE TO authenticated
  USING (public.is_superadmin() OR public.is_writer());