-- Add imageUrl and linkUrl fields to novidades table
ALTER TABLE public.novidades
ADD COLUMN imageUrl TEXT,
ADD COLUMN linkUrl TEXT;