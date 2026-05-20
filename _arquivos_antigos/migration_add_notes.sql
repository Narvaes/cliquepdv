-- Migration: Add Observation Column to Sales

-- 1. Add observation column to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS observation TEXT;

-- 2. Force schema cache refresh
NOTIFY pgrst, 'reload config';
