-- Add new materi types for chapters and lessons
ALTER TYPE public.materi_type ADD VALUE IF NOT EXISTS 'chapter';
ALTER TYPE public.materi_type ADD VALUE IF NOT EXISTS 'lesson';

-- Add parent_id column to create hierarchical structure
ALTER TABLE public.materi 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.materi(id) ON DELETE CASCADE;

-- Add index for better performance on hierarchy queries
CREATE INDEX IF NOT EXISTS idx_materi_parent_id ON public.materi(parent_id);
CREATE INDEX IF NOT EXISTS idx_materi_kelas_parent ON public.materi(kelas_id, parent_id);

-- Update the type column to support new types
-- Note: This assumes the type column already exists and is using the enum
-- The type should be updated to handle 'chapter' and 'lesson' values

-- Add a constraint to ensure logical hierarchy (chapters can't have chapters as parents)
ALTER TABLE public.materi 
ADD CONSTRAINT check_parent_hierarchy 
CHECK (
  (type = 'pretest' AND parent_id IS NULL) OR
  (type = 'posttest' AND parent_id IS NULL) OR
  (type = 'chapter' AND parent_id IS NULL) OR
  (type = 'lesson' AND parent_id IS NOT NULL) OR
  (type = 'video' AND parent_id IS NULL)
);