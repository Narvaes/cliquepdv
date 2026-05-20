import { supabase } from './supabase';
import { DEFAULT_TEMPLATES, NicheType } from './defaultTemplate';

/**
 * Applies default template to a newly created tenant based on their niche
 * @param tenantId The ID of the newly created tenant
 * @param niche The business niche (bakery, snack_bar, confectionery, restaurant)
 * @param storeName The name of the store
 * @param whatsapp Optional WhatsApp number
 */
export async function applyDefaultTemplate(
    tenantId: string,
    niche: NicheType,
    storeName: string,
    whatsapp?: string
) {
    console.log(`[TemplateSystem] Applying ${niche} template to tenant ${tenantId}`);

    try {
        let template = DEFAULT_TEMPLATES[niche];

        // Fallback to bakery template if niche is invalid
        if (!template) {
            console.warn(`[TemplateSystem] Template for niche "${niche}" not found, using bakery template as fallback`);
            template = DEFAULT_TEMPLATES['bakery'];
        }

        // 1. Create Settings
        const settingsToCreate = [
            // Store Info
            { key: 'bakery_name', value: storeName },
            { key: 'whatsapp_number', value: whatsapp || '' },
            { key: 'contact_phone', value: whatsapp || '' },

            // Colors
            { key: 'brand_primary_color', value: template.colors.brand_primary_color },
            { key: 'brand_secondary_color', value: template.colors.brand_secondary_color },
            { key: 'brand_contrast_color', value: template.colors.brand_contrast_color },
            { key: 'header_bg_color', value: template.colors.header_bg_color },
            { key: 'footer_bg_color', value: template.colors.footer_bg_color },
            { key: 'sections_bg_color', value: template.colors.sections_bg_color },

            // Hero Section
            { key: 'hero_title', value: template.settings.hero_title },
            { key: 'hero_subtitle', value: template.settings.hero_subtitle },
            { key: 'hero_tagline', value: `${storeName.toUpperCase()} • EXPERIÊNCIA PREMIUM` },

            // Catalog
            { key: 'catalog_tagline', value: template.settings.catalog_tagline },
            { key: 'catalog_title', value: `Catálogo ${storeName}` },

            // About
            { key: 'about_title', value: template.settings.about_title },
            { key: 'about_description', value: template.settings.about_description },

            // Layout
            { key: 'layout_mode', value: 'complete' },
            { key: 'show_categories', value: 'true' },
            { key: 'show_cart', value: 'true' },
            { key: 'show_about', value: 'true' },
            { key: 'show_testimonials', value: 'true' },

            // SEO
            { key: 'seo_title', value: `${storeName} | Catálogo Digital` },
            { key: 'seo_description', value: template.settings.hero_subtitle },

            // Misc
            { key: 'working_hours', value: 'Segunda a Sábado: 08h às 18h' },
            { key: 'default_delivery_fee', value: '0' },
        ];

        const settingsData = settingsToCreate.map(s => ({
            ...s,
            tenant_id: tenantId
        }));

        const { error: settingsError } = await supabase
            .from('settings')
            .insert(settingsData);

        if (settingsError) {
            console.error('[TemplateSystem] Error creating settings:', settingsError);
        } else {
            console.log(`[TemplateSystem] Created ${settingsData.length} settings`);
        }

        // 2. Create Categories
        const categoriesToCreate = template.categories.map(cat => ({
            name: cat.name,
            code: cat.code,
            display_order: cat.order,
            active: true,
            tenant_id: tenantId
        }));

        let createdCategoryMap: Record<string, string> = {};

        // To map categories correctly, we should insert and return the data. Since standard `.insert` with returning isn't 
        // guaranteed to return order or might just be hard to map back to local, we can insert one by one or fetch them.
        // Inserting one by one to reliably get the code -> id mapping, there are just a few categories.
        for (const cat of categoriesToCreate) {
            const { data: newCat, error: insertCatError } = await supabase
                .from('categories')
                .insert([cat])
                .select('id, code')
                .single();

            if (!insertCatError && newCat) {
                createdCategoryMap[newCat.code] = newCat.id;
            } else {
                console.error('[TemplateSystem] Error creating category:', insertCatError);
            }
        }

        console.log(`[TemplateSystem] Created categories mapping`, createdCategoryMap);

        // 3. Create Default Products
        // Need to check if template.products exists because of potential TypeScript issues or older interfaces
        if ('products' in template && Array.isArray(template.products)) {
            const productsToOps = template.products.map(p => {
                // Resolve Category ID
                const resolvedCategoryId = createdCategoryMap[p.categoryCode] || null;

                // Resolve Category Name (for fallback string column)
                const categoryObj = template.categories.find(c => c.code === p.categoryCode);
                const categoryName = categoryObj ? categoryObj.name : null;

                return {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    image_url: p.imageUrl,
                    unit: p.unit,
                    category: categoryName, // string name
                    category_id: resolvedCategoryId, // UUID
                    display_order: p.order,
                    active: true,
                    tenant_id: tenantId
                };
            });

            if (productsToOps.length > 0) {
                const { error: productsError } = await supabase
                    .from('products')
                    .insert(productsToOps);

                if (productsError) {
                    console.error('[TemplateSystem] Error creating default products:', productsError);
                } else {
                    console.log(`[TemplateSystem] Created ${productsToOps.length} default products`);
                }
            }
        }

        console.log('[TemplateSystem] Template applied successfully');
        return { success: true };

    } catch (err) {
        console.error('[TemplateSystem] Unexpected error:', err);
        return { success: false, error: err };
    }
}

/**
 * Legacy function - copies template data from an existing tenant
 * Kept for backward compatibility
 */
export async function copyTemplateData(sourceSlug: string, targetTenantId: string, targetName: string, whatsapp?: string) {
    console.log(`[TemplateSystem] Starting template copy from ${sourceSlug} to ${targetTenantId} (Name: ${targetName}, WA: ${whatsapp})`);

    try {
        // 1. Get source tenant ID and name
        const { data: sourceTenant, error: sourceError } = await supabase
            .from('tenants')
            .select('id, name')
            .eq('slug', sourceSlug)
            .single();

        if (sourceError || !sourceTenant) {
            console.error('[TemplateSystem] Source tenant not found:', sourceSlug);
            return;
        }

        const sourceId = sourceTenant.id;
        const sourceName = sourceTenant.name;

        // 2. Copy Settings
        const { data: sourceSettings, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('tenant_id', sourceId);

        if (!settingsError && sourceSettings && sourceSettings.length > 0) {
            const newSettings = sourceSettings.map(s => {
                let value = s.value;

                // 1. Limpeza de Mídias e Contatos Antigos (Não copiar dados da Elite para novos clientes)
                const clearFields = ['logo_url', 'hero_image_url', 'about_image_url', 'address', 'cnpj', 'google_maps_url', 'instagram_url', 'facebook_url', 'tiktok_url', 'meta_pixel_id', 'google_analytics_id', 'google_tag_manager_id'];
                if (clearFields.includes(s.key)) {
                    return { key: s.key, value: '', tenant_id: targetTenantId };
                }

                // 2. Substituição Dinâmica de Nomes
                if (typeof value === 'string') {
                    // Substitui o nome da fonte (ex: "Elite Padaria") pelo nome do alvo
                    if (sourceName) {
                        value = value.replace(new RegExp(sourceName, 'gi'), targetName);
                    }
                    // Substitui "Elite" apenas se for uma palavra isolada para evitar quebrar outras palavras
                    value = value.replace(/\bElite\b/g, targetName);
                }

                // 3. Overrides Lógicos Específicos
                if (s.key === 'bakery_name') value = targetName;
                if (s.key === 'seo_title') value = `${targetName} | Catálogo Digital`;
                if (s.key === 'hero_tagline') value = `${targetName.toUpperCase()} • EXPERIÊNCIA PREMIUM`;

                // 4. Injeção de Contato
                if (whatsapp && (s.key === 'whatsapp_number' || s.key === 'contact_phone')) value = whatsapp;

                return {
                    key: s.key,
                    value: value,
                    tenant_id: targetTenantId
                };
            });

            const { error: insertSettingsError } = await supabase
                .from('settings')
                .insert(newSettings);

            if (insertSettingsError) console.error('[TemplateSystem] Error copying settings:', insertSettingsError);
            else console.log(`[TemplateSystem] Copied ${newSettings.length} settings with dynamic naming, WhatsApp and media cleanup`);
        }

        // 3. Copy Categories
        const { data: sourceCategories, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .eq('tenant_id', sourceId);

        if (!categoriesError && sourceCategories && sourceCategories.length > 0) {
            // Map to track old category ID to new category ID for product association
            const categoryMap: { [oldId: string]: string } = {};

            for (const cat of sourceCategories) {
                const { data: newCat, error: insertCatError } = await supabase
                    .from('categories')
                    .insert([{
                        name: cat.name,
                        description: cat.description,
                        display_order: cat.display_order,
                        active: cat.active,
                        tenant_id: targetTenantId
                    }])
                    .select()
                    .single();

                if (!insertCatError && newCat) {
                    categoryMap[cat.id] = newCat.id;
                }
            }
            console.log(`[TemplateSystem] Copied ${sourceCategories.length} categories`);

            // 4. Copy Products
            const { data: sourceProducts, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('tenant_id', sourceId);

            if (!productsError && sourceProducts && sourceProducts.length > 0) {
                const newProducts = sourceProducts.map(p => ({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    image_url: p.image_url,
                    category: p.category, // string category name
                    category_id: p.category_id ? categoryMap[p.category_id] : null,
                    active: p.active,
                    unit: p.unit,
                    display_order: p.display_order,
                    tenant_id: targetTenantId,
                    gtin: p.gtin,
                    ncm: p.ncm,
                    featured: p.featured
                }));

                const { error: insertProductsError } = await supabase
                    .from('products')
                    .insert(newProducts);

                if (insertProductsError) console.error('[TemplateSystem] Error copying products:', insertProductsError);
                else console.log(`[TemplateSystem] Copied ${newProducts.length} products`);
            }
        }

        console.log('[TemplateSystem] Template copy finished successfully');
    } catch (err) {
        console.error('[TemplateSystem] Unexpected error during copy:', err);
    }
}
