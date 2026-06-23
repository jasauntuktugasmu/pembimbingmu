
-- Helper function: is_writer
CREATE OR REPLACE FUNCTION public.is_writer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_role() = 'writer'::public.user_role;
$$;

-- blog_categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories viewable by all" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Superadmin manages categories" ON public.blog_categories FOR ALL TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- blog_tags
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags viewable by all" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Authed can create tags" ON public.blog_tags FOR INSERT TO authenticated WITH CHECK (public.is_superadmin() OR public.is_writer());
CREATE POLICY "Superadmin updates tags" ON public.blog_tags FOR UPDATE TO authenticated USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
CREATE POLICY "Superadmin deletes tags" ON public.blog_tags FOR DELETE TO authenticated USING (public.is_superadmin());
CREATE TRIGGER update_blog_tags_updated_at BEFORE UPDATE ON public.blog_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- blog_articles
CREATE TABLE public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content JSONB,
  content_html TEXT,
  featured_image TEXT,
  thumbnail_seo TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at TIMESTAMPTZ,
  reading_time_minutes INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  seo_title TEXT,
  meta_description TEXT,
  focus_keyword TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_image TEXT,
  robots_meta TEXT DEFAULT 'index,follow',
  canonical_url TEXT,
  seo_score INTEGER DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_articles TO authenticated;
GRANT ALL ON public.blog_articles TO service_role;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles viewable by all"
  ON public.blog_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Superadmin views all articles"
  ON public.blog_articles FOR SELECT TO authenticated
  USING (public.is_superadmin());

CREATE POLICY "Writers view own articles"
  ON public.blog_articles FOR SELECT TO authenticated
  USING (public.is_writer() AND author_id = auth.uid());

CREATE POLICY "Writers insert own articles"
  ON public.blog_articles FOR INSERT TO authenticated
  WITH CHECK ((public.is_writer() OR public.is_superadmin()) AND author_id = auth.uid());

CREATE POLICY "Writers update own articles"
  ON public.blog_articles FOR UPDATE TO authenticated
  USING (public.is_writer() AND author_id = auth.uid())
  WITH CHECK (public.is_writer() AND author_id = auth.uid());

CREATE POLICY "Superadmin updates all articles"
  ON public.blog_articles FOR UPDATE TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());

CREATE POLICY "Writers delete own articles"
  ON public.blog_articles FOR DELETE TO authenticated
  USING (public.is_writer() AND author_id = auth.uid());

CREATE POLICY "Superadmin deletes any article"
  ON public.blog_articles FOR DELETE TO authenticated
  USING (public.is_superadmin());

CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON public.blog_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.blog_articles_before_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_words INTEGER;
  v_text TEXT;
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;

  IF NEW.content_html IS NOT NULL THEN
    v_text := regexp_replace(NEW.content_html, '<[^>]+>', ' ', 'g');
    v_text := regexp_replace(v_text, '\s+', ' ', 'g');
    v_words := array_length(regexp_split_to_array(trim(v_text), '\s+'), 1);
    IF v_words IS NULL THEN v_words := 0; END IF;
    NEW.word_count := v_words;
    NEW.reading_time_minutes := GREATEST(1, CEIL(v_words::numeric / 200));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_articles_before_save_trg
  BEFORE INSERT OR UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.blog_articles_before_save();

CREATE INDEX idx_blog_articles_status ON public.blog_articles(status);
CREATE INDEX idx_blog_articles_author ON public.blog_articles(author_id);
CREATE INDEX idx_blog_articles_category ON public.blog_articles(category_id);
CREATE INDEX idx_blog_articles_published_at ON public.blog_articles(published_at DESC);

-- blog_article_tags
CREATE TABLE public.blog_article_tags (
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, tag_id)
);
GRANT SELECT ON public.blog_article_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_article_tags TO authenticated;
GRANT ALL ON public.blog_article_tags TO service_role;
ALTER TABLE public.blog_article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Article tags viewable by all" ON public.blog_article_tags FOR SELECT USING (true);
CREATE POLICY "Authors manage own article tags" ON public.blog_article_tags FOR ALL TO authenticated
  USING (
    public.is_superadmin() OR
    EXISTS (SELECT 1 FROM public.blog_articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  )
  WITH CHECK (
    public.is_superadmin() OR
    EXISTS (SELECT 1 FROM public.blog_articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  );

-- blog_related_articles
CREATE TABLE public.blog_related_articles (
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  related_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, related_id),
  CHECK (article_id <> related_id)
);
GRANT SELECT ON public.blog_related_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_related_articles TO authenticated;
GRANT ALL ON public.blog_related_articles TO service_role;
ALTER TABLE public.blog_related_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Related articles viewable by all" ON public.blog_related_articles FOR SELECT USING (true);
CREATE POLICY "Authors manage own related" ON public.blog_related_articles FOR ALL TO authenticated
  USING (
    public.is_superadmin() OR
    EXISTS (SELECT 1 FROM public.blog_articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  )
  WITH CHECK (
    public.is_superadmin() OR
    EXISTS (SELECT 1 FROM public.blog_articles a WHERE a.id = article_id AND a.author_id = auth.uid())
  );

-- blog_article_views
CREATE TABLE public.blog_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.blog_article_views TO anon;
GRANT INSERT, SELECT ON public.blog_article_views TO authenticated;
GRANT ALL ON public.blog_article_views TO service_role;
ALTER TABLE public.blog_article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a view" ON public.blog_article_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Superadmin reads all views" ON public.blog_article_views FOR SELECT TO authenticated USING (public.is_superadmin());
CREATE POLICY "Authors read own article views" ON public.blog_article_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blog_articles a WHERE a.id = article_id AND a.author_id = auth.uid()));

CREATE INDEX idx_blog_article_views_article ON public.blog_article_views(article_id);
CREATE INDEX idx_blog_article_views_at ON public.blog_article_views(viewed_at DESC);
