-- Add columns for Store Settings and Compliance
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS corporate_name text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS printer_settings jsonb DEFAULT '{"paper_width": "80mm"}'::jsonb,
ADD COLUMN IF NOT EXISTS show_cnpj_footer boolean DEFAULT false;
