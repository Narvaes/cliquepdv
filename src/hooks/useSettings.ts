import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import * as constants from '../../constants';
import { useTenant } from '../context/TenantContext';

export const useSettings = () => {
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['settings', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('tenant_id', tenant?.id);

            const settingsMap: any = {
                bakery_name: tenant?.name || 'Sua Empresa',
                whatsapp_number: tenant?.slug === 'elite' ? constants.WHATSAPP_NUMBER : '',
                contact_phone: tenant?.slug === 'elite' ? constants.CONTACT_PHONE : '',
                logo_url: '',
                address: '',
                cnpj: '',
                working_hours: 'Segunda a Sábado: 08h às 18h',
                brand_primary_color: '#F59E0B',
                brand_secondary_color: '#10B981',
                hero_title: `Bem-vindo à ${tenant?.name || 'nossa loja'}`,
                hero_subtitle: 'O melhor em qualidade e atendimento para você e sua família.',
                hero_image_url: '',
                layout_mode: 'complete',
                show_categories: true,
                show_cart: true,
                show_address_footer: true,
                show_cnpj_footer: true,
                meta_pixel_id: '',
                google_analytics_id: '',
                google_tag_manager_id: '',
                // Catalog Section
                catalog_tagline: 'Menu de Experiências',
                catalog_title: '',
                catalog_description: 'Selecione seus itens favoritos abaixo. Montamos seu orçamento em tempo real para envio direto ao nosso WhatsApp.',
                // About Section
                about_section_position: 'before_catalog',
                about_title: 'Nossa História',
                about_description: `Na ${tenant?.name || 'nossa empresa'}, temos o compromisso de oferecer produtos de alta qualidade e um atendimento excepcional. Nossa trajetória é marcada pela busca constante da satisfação de nossos clientes.`,
                about_image_url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
                about_years: '10+',
                about_years_label: 'Anos de Experiência',
                about_f1_title: 'Qualidade',
                about_f1_desc: 'Produtos selecionados com rigor.',
                about_f2_title: 'Confiança',
                about_f2_desc: 'Transparência em tudo o que fazemos.',
                about_f3_title: 'Tradição',
                about_f3_desc: 'Valores que passam de geração em geração.',
                about_f4_title: 'Suporte',
                about_f4_desc: 'Atendimento humanizado e ágil.',
                // Testimonials
                testimonial1_name: 'Cliente Exemplo',
                testimonial1_role: 'CLIENTE',
                testimonial1_content: 'Excelente atendimento e produtos de primeira linha. Recomendo a todos!',
                testimonial1_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                testimonial2_name: 'João Silva',
                testimonial2_role: 'EMPRESÁRIO',
                testimonial2_content: 'Sempre encontro o que preciso com a melhor qualidade da região.',
                testimonial2_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                testimonial3_name: 'Ana Oliveira',
                testimonial3_role: 'REUNIDORA',
                testimonial3_content: 'A dedicação e o carinho com que somos atendidos faz toda a diferença.',
                testimonial3_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                testimonial4_name: 'Carlos Santos',
                testimonial4_role: 'CLIENTE',
                testimonial4_content: 'Ambiente agradável e produtos sempre fresquinhos. Nota dez!',
                testimonial4_image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
                // Styling & Backgrounds
                header_bg_color: '#001b44',
                footer_bg_color: '#001b44',
                sections_bg_color: '#001b44',
                brand_contrast_color: '#001b44',
                // New Fields
                instagram_url: '',
                facebook_url: '',
                tiktok_url: '',
                footer_email: '',
                google_maps_url: '',
                seo_title: '',
                seo_description: '',
                seo_keywords: '',
                // Footer Info Section
                footer_description: 'Aceitamos encomendas com antecedência pelo WhatsApp.',
                footer_working_title: 'Funcionamento',
                footer_working_label: 'Horário de Atendimento',
                footer_orders_label: 'Pedidos Online',
                online_orders_message: 'Aceitamos encomendas com antecedência pelo WhatsApp.',
                cart_empty_message: 'Explore nosso cardápio e adicione os melhores itens!',
                whatsapp_contact_message: 'Olá! Vim pelo site e gostaria de mais informações.',
                whatsapp_checkout_message: 'Vim pelo site e gostaria de confirmar meu pedido!',
                whatsapp_floating_label: 'Falar com Atendente',
                // Navigation Labels
                nav_home_label: 'Início',
                nav_about_label: 'Sobre',
                nav_contact_label: 'Contato',
                nav_checkout_label: 'Finalizar Pedido',
                nav_order_label: 'Encomendar',
                // Footer Labels
                footer_location_title: 'Onde Estamos',
                footer_maps_label: 'Abrir no Google Maps',
                enable_direct_checkout: false,
                pix_key: '',
                default_delivery_fee: 0,
            };

            // Merge with database settings
            if (data) {
                data.forEach((row: any) => {
                    let val = row.value;
                    if (val === 'true') val = true;
                    if (val === 'false') val = false;
                    if (!isNaN(val) && val !== '' && typeof val === 'string') val = Number(val);
                    settingsMap[row.key] = val;
                });
            }

            return settingsMap;
        },
    });
};
