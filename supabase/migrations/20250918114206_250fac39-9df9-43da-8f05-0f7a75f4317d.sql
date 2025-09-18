-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('package-images', 'package-images', true);

-- Create storage policies for package images
CREATE POLICY "Package images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'package-images');

CREATE POLICY "Super admin can upload package images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'package-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Super admin can update package images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'package-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

CREATE POLICY "Super admin can delete package images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'package-images' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);