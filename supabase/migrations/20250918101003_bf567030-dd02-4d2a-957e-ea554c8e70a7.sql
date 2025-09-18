-- Create table for course classes/lessons
CREATE TABLE public.kelas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paket_id UUID NOT NULL REFERENCES public.paket_pembelajaran(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pengajar TEXT NOT NULL,
  deskripsi TEXT,
  thumbnail_url TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
  jumlah_review INTEGER DEFAULT 0,
  durasi_menit INTEGER DEFAULT 0,
  urutan INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kelas table
CREATE POLICY "Superadmin can manage all classes" 
ON public.kelas 
FOR ALL 
USING (is_superadmin());

CREATE POLICY "Subscribers can view classes from their packages" 
ON public.kelas 
FOR SELECT 
USING (
  (get_user_role() = 'subscriber'::user_role) AND 
  has_paket_access(paket_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_kelas_updated_at
BEFORE UPDATE ON public.kelas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Basic package
INSERT INTO public.kelas (paket_id, judul, pengajar, deskripsi, rating, jumlah_review, durasi_menit, urutan) VALUES
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%basic%' LIMIT 1), 'Menentukan Topik Penelitian', 'Kak Yahya', 'Panduan lengkap dalam menentukan topik penelitian yang tepat dan sesuai dengan minat Anda', 4.8, 245, 180, 1),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%basic%' LIMIT 1), 'Menentukan Judul yang Baik dan ACC Dosen', 'Kak Fadil', 'Tips dan trik membuat judul yang menarik dan mudah mendapat persetujuan dari dosen pembimbing', 4.9, 312, 150, 2),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%basic%' LIMIT 1), 'Menyusun Latar Belakang dan BAB 1', 'Kak Azizah', 'Penyusunan latar belakang yang kuat dan BAB 1 yang sistematis untuk skripsi Anda', 4.7, 187, 240, 3),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%basic%' LIMIT 1), 'Fokus Mencari GAP dan Novelty pada BAB 1', 'Kak Sasa', 'Strategi menemukan research gap dan novelty dalam penelitian untuk membuat skripsi yang berkualitas', 4.6, 156, 120, 4);

-- Insert sample data for Pro package (if exists)
INSERT INTO public.kelas (paket_id, judul, pengajar, deskripsi, rating, jumlah_review, durasi_menit, urutan) VALUES
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%pro%' LIMIT 1), 'Menentukan Sampel Penelitian', 'Dr. Budi', 'Metodologi penentuan sampel yang tepat untuk berbagai jenis penelitian', 4.5, 98, 90, 5),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%pro%' LIMIT 1), 'Menentukan Metode Penelitian', 'Prof. Sari', 'Pemilihan metode penelitian yang sesuai dengan topik dan tujuan penelitian', 4.8, 156, 120, 6),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%pro%' LIMIT 1), 'Menentukan Metode Pengumpulan Data', 'Dr. Ahmad', 'Teknik pengumpulan data yang efektif dan efisien', 4.7, 134, 100, 7),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%pro%' LIMIT 1), 'Menentukan Metode Olah Data', 'Dr. Nina', 'Strategi pengolahan data penelitian yang sistematis', 4.6, 87, 150, 8);

-- Insert sample data for Premium package (if exists)
INSERT INTO public.kelas (paket_id, judul, pengajar, deskripsi, rating, jumlah_review, durasi_menit, urutan) VALUES
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%premium%' LIMIT 1), 'Pembelajaran Olah Data SPSS', 'Prof. Eko', 'Analisis data menggunakan SPSS dari dasar hingga advanced', 4.9, 234, 300, 9),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%premium%' LIMIT 1), 'Olah Data Smart PLS', 'Dr. Lisa', 'Structural equation modeling menggunakan Smart PLS', 4.8, 167, 250, 10),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%premium%' LIMIT 1), 'Olah Data Nvivo', 'Dr. Rina', 'Analisis data kualitatif menggunakan software Nvivo', 4.7, 145, 200, 11),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%premium%' LIMIT 1), 'Olah Data e Views', 'Prof. Dani', 'Analisis ekonometri menggunakan e Views', 4.6, 98, 180, 12),
  ((SELECT id FROM public.paket_pembelajaran WHERE nama_paket ILIKE '%premium%' LIMIT 1), 'Cara Menyusun BAB 4 Pembahasan', 'Dr. Maya', 'Panduan menyusun pembahasan yang komprehensif dan mendalam', 4.8, 212, 160, 13);