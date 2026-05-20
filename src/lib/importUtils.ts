/**
 * Simple CSV Parser
 * Handles basics like delimiters and potentially quoted values
 */
export const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
    const data = lines.slice(1).map(line => {
        const values = line.split(';').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });

    return data;
};

/**
 * Generates Template CSV Content
 */
export const generateProductTemplate = () => {
    const headers = ['Nome', 'Categoria', 'Preco', 'Preco_Custo', 'Estoque', 'Unidade', 'EAN', 'NCM', 'Descricao'];
    const row = ['Pão Francês', 'Padaria', '0.50', '0.20', '100', 'un', '7891234567890', '19059090', 'Pão fresquinho todos os dias'];

    return headers.join(';') + '\n' + row.join(';');
};

/**
 * Validates and maps CSV row to Product Object
 */
export const mapCSVToProduct = (row: any, tenantId: string) => {
    // Map human-readable headers to DB fields
    return {
        tenant_id: tenantId,
        name: row['nome'] || '',
        category: row['categoria'] || 'Geral',
        price: parseFloat(row['preco']?.replace(',', '.') || '0'),
        cost_price: parseFloat(row['preco_custo']?.replace(',', '.') || '0'),
        stock_quantity: parseInt(row['estoque'] || '0'),
        unit: row['unidade'] || 'un',
        gtin_ean: row['ean'] || null,
        ncm: row['ncm'] || null,
        description: row['descricao'] || '',
        active: true
    };
};
