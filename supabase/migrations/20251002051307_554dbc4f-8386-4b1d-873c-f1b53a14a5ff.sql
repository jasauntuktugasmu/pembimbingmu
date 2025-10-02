-- Add unique constraint to email column in authorized_emails table
ALTER TABLE public.authorized_emails 
ADD CONSTRAINT authorized_emails_email_unique UNIQUE (email);