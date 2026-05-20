-- Add address column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Add document column just in case it's also missing (common for CPF/CNPJ)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS document TEXT;

-- Add notes column if missing
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for document searches
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);

COMMENT ON COLUMN clients.address IS 'Full address of the client';
COMMENT ON COLUMN clients.document IS 'CPF or CNPJ document';
COMMENT ON COLUMN clients.notes IS 'Internal notes about the client';
