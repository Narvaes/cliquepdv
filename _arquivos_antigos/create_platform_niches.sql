-- Create platform_niches table
CREATE TABLE IF NOT EXISTS platform_niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default niches
INSERT INTO platform_niches (name, slug) VALUES
('Padaria', 'bakery'),
('Lanchonete', 'snack_bar'),
('Pizzaria', 'pizzeria'),
('Confeitaria', 'confectionery'),
('Mercado', 'market'),
('Outro', 'other')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE platform_niches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Niches" ON platform_niches FOR SELECT USING (true);
CREATE POLICY "Super Admin Manage Niches" ON platform_niches FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
);
