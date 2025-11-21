-- Add imageUrl and linkUrl fields to novidades table
ALTER TABLE novidades
ADD COLUMN imageUrl VARCHAR(500) NULL,
ADD COLUMN linkUrl VARCHAR(500) NULL;