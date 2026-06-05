-- Migration to add file_name to vaults table
ALTER TABLE public.vaults
ADD COLUMN file_name TEXT NOT NULL DEFAULT 'untitled_secret.txt';
