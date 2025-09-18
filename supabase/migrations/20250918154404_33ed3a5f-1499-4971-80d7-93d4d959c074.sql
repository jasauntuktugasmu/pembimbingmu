-- Check current materi table structure and add new capabilities

-- Add parent_id column to create hierarchical structure
ALTER TABLE public.materi 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.materi(id) ON DELETE CASCADE;

-- Add index for better performance on hierarchy queries
CREATE INDEX IF NOT EXISTS idx_materi_parent_id ON public.materi(parent_id);
CREATE INDEX IF NOT EXISTS idx_materi_kelas_parent ON public.materi(kelas_id, parent_id);

-- The type field should already be text, so we don't need to change it
-- We'll handle the new types ('chapter', 'lesson') in the application code

-- Add a description field for chapters and lessons
ALTER TABLE public.materi 
ADD COLUMN IF NOT EXISTS deskripsi TEXT;