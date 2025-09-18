-- Create materi table for lesson content
CREATE TABLE public.materi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kelas_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pretest', 'video', 'posttest')),
  judul TEXT NOT NULL,
  link_video TEXT,
  thumbnail TEXT,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create soal table for quiz questions
CREATE TABLE public.soal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materi_id UUID NOT NULL,
  pertanyaan TEXT NOT NULL,
  pilihan_a TEXT NOT NULL,
  pilihan_b TEXT NOT NULL,
  pilihan_c TEXT NOT NULL,
  pilihan_d TEXT NOT NULL,
  jawaban_benar TEXT NOT NULL CHECK (jawaban_benar IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progress table for tracking user progress
CREATE TABLE public.progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  materi_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'complete')),
  skor INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, materi_id)
);

-- Enable Row Level Security
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for materi table
CREATE POLICY "Subscribers can view materi from their packages" 
ON public.materi 
FOR SELECT 
USING (
  get_user_role() = 'subscriber' AND 
  EXISTS (
    SELECT 1 FROM public.kelas k
    WHERE k.id = materi.kelas_id AND has_paket_access(k.paket_id)
  )
);

CREATE POLICY "Superadmin can manage all materi" 
ON public.materi 
FOR ALL 
USING (is_superadmin());

-- RLS Policies for soal table
CREATE POLICY "Subscribers can view soal from their accessible materi" 
ON public.soal 
FOR SELECT 
USING (
  get_user_role() = 'subscriber' AND 
  EXISTS (
    SELECT 1 FROM public.materi m
    JOIN public.kelas k ON k.id = m.kelas_id
    WHERE m.id = soal.materi_id AND has_paket_access(k.paket_id)
  )
);

CREATE POLICY "Superadmin can manage all soal" 
ON public.soal 
FOR ALL 
USING (is_superadmin());

-- RLS Policies for progress table
CREATE POLICY "Users can view their own progress" 
ON public.progress 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" 
ON public.progress 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress records" 
ON public.progress 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Superadmin can manage all progress" 
ON public.progress 
FOR ALL 
USING (is_superadmin());

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_materi_updated_at
BEFORE UPDATE ON public.materi
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soal_updated_at
BEFORE UPDATE ON public.soal
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
BEFORE UPDATE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();