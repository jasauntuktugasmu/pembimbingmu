-- Add new fields to paket_pembelajaran table for category card display
ALTER TABLE public.paket_pembelajaran 
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#f97316',
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Mulai Kelas',
ADD COLUMN IF NOT EXISTS category_link TEXT,
ADD COLUMN IF NOT EXISTS gradient_from TEXT DEFAULT '#f97316',
ADD COLUMN IF NOT EXISTS gradient_to TEXT DEFAULT '#fb923c';

-- Update existing packages with colorful gradients
UPDATE public.paket_pembelajaran 
SET 
  background_color = '#f97316',
  gradient_from = '#f97316', 
  gradient_to = '#fb923c',
  button_text = 'Mulai Kelas'
WHERE nama_paket = 'Paket Basic';

UPDATE public.paket_pembelajaran 
SET 
  background_color = '#8b5cf6',
  gradient_from = '#8b5cf6',
  gradient_to = '#a78bfa', 
  button_text = 'Mulai Kelas'
WHERE nama_paket = 'Paket Pro';

UPDATE public.paket_pembelajaran 
SET 
  background_color = '#3b82f6',
  gradient_from = '#3b82f6',
  gradient_to = '#60a5fa',
  button_text = 'Mulai Kelas'  
WHERE nama_paket = 'Paket Premium';