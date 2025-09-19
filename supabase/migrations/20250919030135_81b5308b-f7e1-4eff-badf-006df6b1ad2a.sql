-- Drop the existing check constraint that only allows pretest, video, posttest
ALTER TABLE public.materi DROP CONSTRAINT IF EXISTS materi_type_check;

-- Add updated constraint to include chapter and lesson types
ALTER TABLE public.materi ADD CONSTRAINT materi_type_check 
CHECK (type = ANY (ARRAY['pretest'::text, 'video'::text, 'posttest'::text, 'chapter'::text, 'lesson'::text]));