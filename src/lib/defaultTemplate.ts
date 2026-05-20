// Default template configurations for new stores by niche
export const DEFAULT_TEMPLATES = {
    bakery: {
        name: 'Padaria',
        colors: {
            brand_primary_color: '#F59E0B', // Amber
            brand_secondary_color: '#10B981', // Green
            brand_contrast_color: '#78350F', // Brown
            header_bg_color: '#78350F',
            footer_bg_color: '#78350F',
            sections_bg_color: '#78350F',
        },
        categories: [
            { name: 'Pães', code: 'paes', order: 1 },
            { name: 'Doces', code: 'doces', order: 2 },
            { name: 'Salgados', code: 'salgados', order: 3 },
            { name: 'Bolos', code: 'bolos', order: 4 },
            { name: 'Bebidas', code: 'bebidas', order: 5 },
        ],
        products: [
            { name: 'Pão Francês Tradicional', description: 'Nosso clássico pão francês, assado a cada hora com casquinha crocante e miolo macio.', price: 1.50, categoryCode: 'paes', imageUrl: 'https://images.unsplash.com/photo-1596241913164-8397a612501e?auto=format&fit=crop&q=80', unit: 'un', order: 1 },
            { name: 'Croissant Manteiga', description: 'Massa folhada autêntica com pura manteiga, derrete na boca.', price: 8.90, categoryCode: 'paes', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80', unit: 'un', order: 2 },
            { name: 'Bolo de Cenoura com Chocolate', description: 'Fatia generosa de bolo de cenoura fofinho com cobertura trufada de chocolate.', price: 12.00, categoryCode: 'bolos', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80', unit: 'fatia', order: 3 },
            { name: 'Coxinha de Frango Gourmet', description: 'Recheio cremoso de frango com catupiry em uma massa sequinha.', price: 7.50, categoryCode: 'salgados', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80', unit: 'un', order: 4 },
            { name: 'Sonho de Creme', description: 'Massa leve e fofinha, recheada com nosso creme de baunilha exclusivo.', price: 5.50, categoryCode: 'doces', imageUrl: 'https://images.unsplash.com/photo-1603593459957-c1bdc31eb35b?auto=format&fit=crop&q=80', unit: 'un', order: 5 },
            { name: 'Café Expresso Premium', description: 'Blend 100% arábica, torra média com notas de caramelo.', price: 4.50, categoryCode: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?auto=format&fit=crop&q=80', unit: 'un', order: 6 },
        ],
        settings: {
            hero_title: 'Tradição e Sabor em Cada Mordida',
            hero_subtitle: 'Produtos fresquinhos todos os dias, feitos com carinho para você.',
            catalog_tagline: 'Nosso Catálogo',
            about_title: 'A Excelência da Panificação',
            about_description: 'Somos apaixonados por oferecer qualidade premium em cada detalhe. Nossa missão é criar memórias através do sabor.',
        }
    },
    snack_bar: {
        name: 'Lanchonete',
        colors: {
            brand_primary_color: '#DC2626', // Red
            brand_secondary_color: '#FBBF24', // Yellow
            brand_contrast_color: '#7C2D12', // Dark red
            header_bg_color: '#7C2D12',
            footer_bg_color: '#7C2D12',
            sections_bg_color: '#7C2D12',
        },
        categories: [
            { name: 'Lanches', code: 'lanches', order: 1 },
            { name: 'Porções', code: 'porcoes', order: 2 },
            { name: 'Bebidas', code: 'bebidas', order: 3 },
            { name: 'Sobremesas', code: 'sobremesas', order: 4 },
        ],
        products: [
            { name: 'X-Tudo Artesanal', description: 'Hambúrguer de 150g, bacon crocante, ovo, queijo prato, presunto, alface e tomate no pão brioche.', price: 28.90, categoryCode: 'lanches', imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80', unit: 'un', order: 1 },
            { name: 'Hambúrguer Duplo Cheddar', description: 'Dois smash burgers de 90g, muito cheddar cremoso e cebola caramelizada.', price: 32.50, categoryCode: 'lanches', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80', unit: 'un', order: 2 },
            { name: 'Porção de Fritas com Bacon', description: 'Batatas rústicas com cheddar derretido e cubos de bacon crocante (serve 2).', price: 35.00, categoryCode: 'porcoes', imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80', unit: 'un', order: 3 },
            { name: 'Onion Rings', description: 'Anéis de cebola empanados acompanhados do nosso molho especial.', price: 24.90, categoryCode: 'porcoes', imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&q=80', unit: 'un', order: 4 },
            { name: 'Milkshake de Morango', description: 'Feito com sorvete artesanal, pedaços de morango e chantilly.', price: 18.00, categoryCode: 'sobremesas', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968bca52084?auto=format&fit=crop&q=80', unit: 'un', order: 5 },
            { name: 'Refrigerante Lata 350ml', description: 'Coca-cola gelada.', price: 6.00, categoryCode: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80', unit: 'un', order: 6 },
        ],
        settings: {
            hero_title: 'Sabor que Conquista em Cada Lanche',
            hero_subtitle: 'Lanches artesanais preparados na hora com ingredientes selecionados.',
            catalog_tagline: 'Nosso Menu',
            about_title: 'Tradição em Lanches',
            about_description: 'Combinamos receitas tradicionais com ingredientes frescos para criar lanches inesquecíveis.',
        }
    },
    confectionery: {
        name: 'Confeitaria',
        colors: {
            brand_primary_color: '#EC4899', // Pink
            brand_secondary_color: '#A855F7', // Purple
            brand_contrast_color: '#831843', // Dark pink
            header_bg_color: '#831843',
            footer_bg_color: '#831843',
            sections_bg_color: '#831843',
        },
        categories: [
            { name: 'Bolos', code: 'bolos', order: 1 },
            { name: 'Doces Finos', code: 'doces-finos', order: 2 },
            { name: 'Tortas', code: 'tortas', order: 3 },
            { name: 'Cupcakes', code: 'cupcakes', order: 4 },
            { name: 'Bebidas', code: 'bebidas', order: 5 },
        ],
        products: [
            { name: 'Bolo Red Velvet', description: 'Nossa assinatura: massa aveludada com recheio de cream cheese frosting. Decorado com frutas vermelhas.', price: 18.50, categoryCode: 'bolos', imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&q=80', unit: 'fatia', order: 1 },
            { name: 'Macaron Sortido', description: 'Caixinha com 6 unidades dos nossos macarons parisienses. Sabores diversos.', price: 35.00, categoryCode: 'doces-finos', imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80', unit: 'caixa', order: 2 },
            { name: 'Torta de Limão Siciliano', description: 'Massa sablée crocante, creme de limão siciliano e merengue italiano maçaricado.', price: 16.00, categoryCode: 'tortas', imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80', unit: 'fatia', order: 3 },
            { name: 'Cupcake de Chocolate Belga', description: 'Massa super úmida com cobertura generosa de ganache de chocolate belga.', price: 12.00, categoryCode: 'cupcakes', imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&q=80', unit: 'un', order: 4 },
            { name: 'Brigadeiro Gourmet Calelebaut', description: 'Brigadeiro tradicional feito com cacau 100% e granulado belga.', price: 6.50, categoryCode: 'doces-finos', imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&q=80', unit: 'un', order: 5 },
            { name: 'Cappuccino Italiano', description: 'Espresso com leite vaporizado e uma pitada de canela.', price: 10.00, categoryCode: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1534685302058-75646d50dc68?auto=format&fit=crop&q=80', unit: 'un', order: 6 },
        ],
        settings: {
            hero_title: 'Doçura e Arte em Cada Criação',
            hero_subtitle: 'Doces artesanais feitos com amor e os melhores ingredientes.',
            catalog_tagline: 'Nossas Delícias',
            about_title: 'A Arte da Confeitaria',
            about_description: 'Transformamos momentos especiais em memórias doces com nossas criações artesanais.',
        }
    },
    restaurant: {
        name: 'Restaurante',
        colors: {
            brand_primary_color: '#10B981', // Green
            brand_secondary_color: '#F97316', // Orange
            brand_contrast_color: '#064E3B', // Dark green
            header_bg_color: '#064E3B',
            footer_bg_color: '#064E3B',
            sections_bg_color: '#064E3B',
        },
        categories: [
            { name: 'Entradas', code: 'entradas', order: 1 },
            { name: 'Pratos Principais', code: 'pratos-principais', order: 2 },
            { name: 'Acompanhamentos', code: 'acompanhamentos', order: 3 },
            { name: 'Sobremesas', code: 'sobremesas', order: 4 },
            { name: 'Bebidas', code: 'bebidas', order: 5 },
        ],
        products: [
            { name: 'Risoto de Cogumelos Trufado', description: 'Arroz arbóreo preparado com mix de cogumelos frescos, azeite trufado e parmesão curado.', price: 58.00, categoryCode: 'pratos-principais', imageUrl: 'https://images.unsplash.com/photo-1633337474564-9d9fc48074d3?auto=format&fit=crop&q=80', unit: 'un', order: 1 },
            { name: 'Bife Ancho com Chimichurri', description: 'Corte nobre grelhado ao ponto do chef, batatas rústicas e molho chimichurri artesanal.', price: 75.00, categoryCode: 'pratos-principais', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80', unit: 'un', order: 2 },
            { name: 'Bruschetta Tradicional', description: 'Fatias de pão italiano tostado com tomates frescos, manjericão, alho e azeite.', price: 28.00, categoryCode: 'entradas', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&q=80', unit: 'porção', order: 3 },
            { name: 'Salmão Grelhado', description: 'Filé de salmão com crosta de gergelim, acompanhado de purê de batata baroa.', price: 68.00, categoryCode: 'pratos-principais', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80', unit: 'un', order: 4 },
            { name: 'Petit Gâteau', description: 'Bolo quente de chocolate com interior cremoso, acompanhado de sorvete de baunilha.', price: 26.00, categoryCode: 'sobremesas', imageUrl: 'https://images.unsplash.com/photo-1624353365286-cb83f982a0be?auto=format&fit=crop&q=80', unit: 'un', order: 5 },
            { name: 'Taça de Vinho Tinto', description: 'Malbec Argentino selecionado da nossa adega.', price: 22.00, categoryCode: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80', unit: 'taça', order: 6 },
        ],
        settings: {
            hero_title: 'Experiência Gastronômica Única',
            hero_subtitle: 'Pratos preparados com ingredientes frescos e técnicas refinadas.',
            catalog_tagline: 'Nosso Catálogo',
            about_title: 'Gastronomia de Excelência',
            about_description: 'Oferecemos uma experiência culinária memorável com pratos que celebram sabores autênticos.',
        }
    },
    pizzeria: {
        name: 'Pizzaria',
        colors: {
            brand_primary_color: '#EF4444', // Red
            brand_secondary_color: '#EAB308', // Yellow
            brand_contrast_color: '#7F1D1D', // Dark Red
            header_bg_color: '#7F1D1D',
            footer_bg_color: '#7F1D1D',
            sections_bg_color: '#7F1D1D',
        },
        categories: [
            { name: 'Pizzas Tradicionais', code: 'pizzas-tradicionais', order: 1 },
            { name: 'Pizzas Especiais', code: 'pizzas-especiais', order: 2 },
            { name: 'Pizzas Doces', code: 'pizzas-doces', order: 3 },
            { name: 'Bebidas', code: 'bebidas', order: 4 },
        ],
        products: [
            { name: 'Pizza Calabresa', description: 'Calabresa fatiada, cebola, azeitonas e mussarela derretida.', price: 49.90, categoryCode: 'pizzas-tradicionais', imageUrl: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?auto=format&fit=crop&q=80', unit: 'un', order: 1 },
            { name: 'Pizza Margherita', description: 'Mussarela, rodelas de tomate fresco e manjericão selecionado.', price: 45.90, categoryCode: 'pizzas-tradicionais', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80', unit: 'un', order: 2 },
            { name: 'Pizza Quatro Queijos', description: 'Mussarela, provolone, gorgonzola e catupiry original.', price: 59.90, categoryCode: 'pizzas-especiais', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80', unit: 'un', order: 3 },
            { name: 'Pizza de Peperoni', description: 'Fatias de peperoni premium com mussarela e pimentão.', price: 62.00, categoryCode: 'pizzas-especiais', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80', unit: 'un', order: 4 },
            { name: 'Pizza de Chocolate com Morango', description: 'Muito chocolate ao leite derretido coberto com morangos frescos.', price: 55.00, categoryCode: 'pizzas-doces', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80', unit: 'un', order: 5 },
            { name: 'Refrigerante 2 Litros', description: 'Coca-cola gelada.', price: 12.00, categoryCode: 'bebidas', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80', unit: 'un', order: 6 },
        ],
        settings: {
            hero_title: 'Sabor e Tradição na Verdadeira Pizza',
            hero_subtitle: 'Massa artesanal, ingredientes frescos e assada com perfeição.',
            catalog_tagline: 'Nosso Cardápio',
            about_title: 'Mestres na Arte da Pizza',
            about_description: 'Nós unimos a tradição da pizza italiana com sabores incríveis.',
        }
    },
    other: {
        name: 'Outro',
        colors: {
            brand_primary_color: '#4F46E5', // Indigo
            brand_secondary_color: '#06B6D4', // Cyan
            brand_contrast_color: '#312E81', // Dark Indigo
            header_bg_color: '#312E81',
            footer_bg_color: '#312E81',
            sections_bg_color: '#312E81',
        },
        categories: [
            { name: 'Categoria 1', code: 'cat-1', order: 1 },
            { name: 'Categoria 2', code: 'cat-2', order: 2 },
            { name: 'Promoções', code: 'promocoes', order: 3 },
        ],
        products: [
            { name: 'Produto Destaque 1', description: 'Seu produto incrível, descreva aqui os principais atributos dele.', price: 99.90, categoryCode: 'cat-1', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80', unit: 'un', order: 1 },
            { name: 'Produto Destaque 2', description: 'Produto de alta qualidade para seus melhores clientes.', price: 149.90, categoryCode: 'cat-2', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80', unit: 'un', order: 2 },
            { name: 'Kit Promocional', description: 'Aproveite essa oferta exclusiva com os melhores itens.', price: 299.00, categoryCode: 'promocoes', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80', unit: 'kit', order: 3 },
        ],
        settings: {
            hero_title: 'Sua Loja Profissional Online',
            hero_subtitle: 'O melhor espaço para seus produtos, com a facilidade que você precisa.',
            catalog_tagline: 'Produtos em Destaque',
            about_title: 'Conheça Mais',
            about_description: 'Somos focados em oferecer os melhores produtos do mercado para você.',
        }
    }
};

export type NicheType = keyof typeof DEFAULT_TEMPLATES;
