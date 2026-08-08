GRANT SELECT ON public.blog_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;

CREATE POLICY "Writers can upload package images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'package-images' AND (public.is_writer() OR public.is_superadmin()));

CREATE POLICY "Writers can update own package images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'package-images' AND owner = auth.uid() AND (public.is_writer() OR public.is_superadmin()))
WITH CHECK (bucket_id = 'package-images' AND owner = auth.uid() AND (public.is_writer() OR public.is_superadmin()));

CREATE POLICY "Writers can delete own package images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'package-images' AND owner = auth.uid() AND (public.is_writer() OR public.is_superadmin()));