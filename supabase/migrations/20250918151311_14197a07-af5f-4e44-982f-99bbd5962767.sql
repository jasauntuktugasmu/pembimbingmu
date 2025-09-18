-- Create new table for multiple videos per materi
CREATE TABLE public.video_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materi_id UUID NOT NULL REFERENCES public.materi(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  link_youtube TEXT NOT NULL,
  thumbnail TEXT,
  urutan INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_links ENABLE ROW LEVEL SECURITY;

-- Create policies for video_links
CREATE POLICY "Subscribers can view video links from their accessible materi" 
ON public.video_links 
FOR SELECT 
USING (
  get_user_role() = 'subscriber'::user_role AND 
  EXISTS (
    SELECT 1 
    FROM materi m
    JOIN kelas k ON k.id = m.kelas_id
    WHERE m.id = video_links.materi_id 
    AND has_paket_access(k.paket_id)
  )
);

CREATE POLICY "Superadmin can manage all video links" 
ON public.video_links 
FOR ALL 
USING (is_superadmin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_links_updated_at
BEFORE UPDATE ON public.video_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_video_links_materi_id ON public.video_links(materi_id);
CREATE INDEX idx_video_links_urutan ON public.video_links(materi_id, urutan);