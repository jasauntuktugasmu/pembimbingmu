-- Add missing fields to kelas table for the new class management feature
ALTER TABLE public.kelas 
ADD COLUMN IF NOT EXISTS durasi_text text, -- Duration in text format like "5h 30m"
ADD COLUMN IF NOT EXISTS jumlah_user integer DEFAULT 0, -- Number of users joined
ADD COLUMN IF NOT EXISTS harga_asli numeric, -- Original price (optional)
ADD COLUMN IF NOT EXISTS harga_diskon numeric, -- Discount price (optional)
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner'; -- Class level: Beginner, Intermediate, Advanced

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kelas_paket_id ON public.kelas(paket_id);
CREATE INDEX IF NOT EXISTS idx_kelas_level ON public.kelas(level);