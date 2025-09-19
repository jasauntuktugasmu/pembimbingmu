-- Add policy to allow public access to view packages on landing page
CREATE POLICY "Anyone can view packages for landing page" 
ON public.paket_pembelajaran 
FOR SELECT 
USING (true);