-- Create table for neutering registrations
CREATE TABLE public.neutering_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  animal_type TEXT NOT NULL CHECK (animal_type IN ('gato', 'cachorro')),
  animal_gender TEXT NOT NULL CHECK (animal_gender IN ('macho', 'femea')),
  animal_age TEXT NOT NULL,
  is_neutered BOOLEAN NOT NULL DEFAULT false,
  vaccinations_updated BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.neutering_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public form)
CREATE POLICY "Anyone can submit registration" 
ON public.neutering_registrations 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view registrations (for admin purposes)
CREATE POLICY "Anyone can view registrations" 
ON public.neutering_registrations 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_neutering_registrations_updated_at
BEFORE UPDATE ON public.neutering_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_neutering_registrations_status ON public.neutering_registrations(status);
CREATE INDEX idx_neutering_registrations_created_at ON public.neutering_registrations(created_at DESC);