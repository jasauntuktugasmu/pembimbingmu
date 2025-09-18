-- Add unique constraint to prevent duplicate progress records for the same user and materi
ALTER TABLE public.progress 
ADD CONSTRAINT unique_user_materi_progress 
UNIQUE (user_id, materi_id);