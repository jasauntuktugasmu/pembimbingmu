-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('superadmin', 'subscriber');

-- Add role column to existing profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'subscriber';

-- Create paket_pembelajaran table
CREATE TABLE public.paket_pembelajaran (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_paket TEXT NOT NULL,
  deskripsi TEXT,
  harga DECIMAL(10,2),
  durasi_hari INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create paket_content table for storing content of each package
CREATE TABLE public.paket_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paket_id UUID NOT NULL REFERENCES public.paket_pembelajaran(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  konten TEXT,
  urutan INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paket_id UUID NOT NULL REFERENCES public.paket_pembelajaran(id) ON DELETE CASCADE,
  durasi_mulai TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  durasi_akhir TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, paket_id)
);

-- Create akses_log table for tracking access
CREATE TABLE public.akses_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paket_id UUID REFERENCES public.paket_pembelajaran(id) ON DELETE SET NULL,
  halaman TEXT NOT NULL,
  waktu_akses TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.paket_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paket_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akses_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() = 'superadmin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user has access to paket
CREATE OR REPLACE FUNCTION public.has_paket_access(paket_id_input UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscribers s
    WHERE s.user_id = auth.uid() 
    AND s.paket_id = paket_id_input 
    AND s.status = 'active'
    AND s.durasi_akhir > now()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for paket_pembelajaran
CREATE POLICY "Superadmin can manage all paket" ON public.paket_pembelajaran
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Subscribers can view paket they have access to" ON public.paket_pembelajaran
  FOR SELECT USING (
    public.get_user_role() = 'subscriber' AND 
    EXISTS (
      SELECT 1 FROM public.subscribers s 
      WHERE s.user_id = auth.uid() 
      AND s.paket_id = paket_pembelajaran.id 
      AND s.status = 'active'
      AND s.durasi_akhir > now()
    )
  );

-- RLS Policies for paket_content
CREATE POLICY "Superadmin can manage all content" ON public.paket_content
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Subscribers can view content of their paket" ON public.paket_content
  FOR SELECT USING (
    public.get_user_role() = 'subscriber' AND 
    public.has_paket_access(paket_content.paket_id)
  );

-- RLS Policies for subscribers
CREATE POLICY "Superadmin can manage all subscribers" ON public.subscribers
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for akses_log
CREATE POLICY "Superadmin can view all logs" ON public.akses_log
  FOR SELECT USING (public.is_superadmin());

CREATE POLICY "Users can view their own logs" ON public.akses_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert their own logs" ON public.akses_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insert default paket pembelajaran
INSERT INTO public.paket_pembelajaran (nama_paket, deskripsi, harga, durasi_hari) VALUES
  ('Paket A - Basic', 'Paket pembelajaran dasar untuk pemula', 99000, 30),
  ('Paket B - Intermediate', 'Paket pembelajaran menengah dengan fitur lanjutan', 199000, 60),
  ('Paket C - Advanced', 'Paket pembelajaran lanjutan dengan akses penuh', 299000, 90);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_paket_pembelajaran_updated_at
  BEFORE UPDATE ON public.paket_pembelajaran
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_paket_content_updated_at
  BEFORE UPDATE ON public.paket_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();