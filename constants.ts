
import { MenuItem, Category } from './types';

export const WHATSAPP_NUMBER = '5516981746181';
export const CONTACT_PHONE = '(16) 3904-5115';
export const ADDRESS = 'Av. Lygia Latuf Salomão, 525 - Nova Aliança, Ribeirão Preto - SP';

export const CATEGORIES: Category[] = [
  'Salgados Fritos',
  'Salgados Assados',
  'Lanches de Metro',
  'Mini Lanches',
  'Doces',
  'Bolos Confeitados',
  'Bolos Clássicos',
  'Tábuas de Frios',
  'Cestas de Pães'
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Dona Maria Helena",
    role: "Cliente fiel",
    content: "Excelente atendimento e produtos de primeira linha. Recomendo a todos!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Sr. Antônio Carlos",
    role: "Cliente",
    content: "Sempre encontro o que preciso com a melhor qualidade da região. Atendimento nota dez.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    name: "Lúcia e Roberto",
    role: "Casal de Clientes",
    content: "A dedicação e o carinho com que somos atendidos faz toda a diferença em nossa rotina.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
  }
];

export const MENU_ITEMS: MenuItem[] = [
  // --- SALGADOS FRITOS (Cento) ---
  {
    id: 'sf1',
    name: 'Cento de Pastel',
    description: 'Sabores: Carne, frango, queijo, palmito, presunto e queijo.',
    price: 99.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: '/products/pastel.png'
  },
  {
    id: 'sf2',
    name: 'Bolinha de Queijo',
    description: 'Crocante por fora, queijo derretido por dentro.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: '/products/bolinha_queijo.png'
  },
  {
    id: 'sf3',
    name: 'Coxinha',
    description: 'A rainha dos salgados. Massa de batata e recheio suculento.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: '/products/coxinha.png'
  },
  {
    id: 'sf4',
    name: 'Croquete',
    description: 'Sabores: Alho poró c/ pimenta ou Carne.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1e3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sf5',
    name: 'Enroladinho P&Q',
    description: 'Presunto e queijo em massa leve.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: 'https://images.unsplash.com/photo-1626379625535-b5d1b9d1b6a8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sf6',
    name: 'Quibe',
    description: 'Tradicional, temperado com hortelã.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sf7',
    name: 'Risoles',
    description: 'Sabores: Milho ou Presunto e Queijo.',
    price: 90.00,
    unit: '/cento',
    category: 'Salgados Fritos',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80'
  },

  // --- SALGADOS ASSADOS (KG) ---
  {
    id: 'sa1',
    name: 'Carolina Salgada',
    description: 'Recheios: Palmito ou Salpicão de Frango. Massa choux leve.',
    price: 85.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa2',
    name: 'Quiches',
    description: 'Catupiry, Cream cheese, Patê de ervas ou Frango desfiado.',
    price: 85.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1481546949987-203c621350a4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa3',
    name: 'Mini Croissant',
    description: 'Frango, P&Q, Peito de Peru ou 4 Queijos.',
    price: 85.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa4',
    name: 'Dadinhos de Tapioca',
    description: 'Crocantes e macios por dentro.',
    price: 75.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf389c25?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa5',
    name: 'Empada',
    description: 'Frango ou Palmito. Massa podre que derrete na boca.',
    price: 85.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1610450917240-f1311029472e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa6',
    name: 'Pão de Queijo',
    description: 'Mineiro legítimo.',
    price: 68.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1564355430156-6059d04427c3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa7',
    name: 'Chipa',
    description: 'O clássico paraguaio.',
    price: 76.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1625938145244-e460542a087c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa8',
    name: 'Enroladinhos Assados',
    description: 'Presunto e Queijo ou Salsicha.',
    price: 69.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1617196037803-39500cdb55bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa9',
    name: 'Esfirra',
    description: 'Carne ou Frango.',
    price: 69.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1628198089953-d142b78129cc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa10',
    name: 'Torteletes',
    description: 'Brócolis, Frango, Peito de Peru ou 4 Queijos.',
    price: 69.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1601205741712-b261aff33a7d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sa11',
    name: 'Pão de Batata',
    description: 'Com cream cheese ou requeijão.',
    price: 69.00,
    unit: '/kg',
    category: 'Salgados Assados',
    image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80'
  },

  // --- MINI LANCHES ---
  {
    id: 'ml1',
    name: 'Mini Peito de Peru',
    description: 'Com queijo minas.',
    price: 5.20,
    unit: '/unid',
    category: 'Mini Lanches',
    image: 'https://images.unsplash.com/photo-1509722747755-e9921675cf3f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ml2',
    name: 'Mini Salame',
    description: 'Com queijo prato.',
    price: 5.20,
    unit: '/unid',
    category: 'Mini Lanches',
    image: 'https://images.unsplash.com/photo-1606850780554-b55eaac846dc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ml3',
    name: 'Mini P&Q',
    description: 'Presunto e queijo clássico.',
    price: 4.80,
    unit: '/unid',
    category: 'Mini Lanches',
    image: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=800&q=80'
  },

  // --- LANCHES DE METRO ---
  {
    id: 'lm1',
    name: 'Copa',
    description: 'Copa e muçarela. Serve 24 fatias.',
    price: 100.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1509722747755-e9921675cf3f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm2',
    name: 'Peito de Peru',
    description: 'Peito de peru e muçarela. Serve 24 fatias.',
    price: 90.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm3',
    name: 'Presunto e Queijo',
    description: 'Presunto e muçarela. Serve 24 fatias.',
    price: 82.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e3b4b53b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm4',
    name: 'Quatro Queijos',
    description: 'Prato, muçarela, provolone, cheddar. Serve 24 fatias.',
    price: 89.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm5',
    name: 'Rúcula c/ Tomate Seco',
    description: 'Muçarela, tomate seco, rúcula. Serve 24 fatias.',
    price: 90.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm6',
    name: 'Salame',
    description: 'Salame e queijo prato. Serve 24 fatias.',
    price: 94.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1549488497-66a3ea6ca456?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm7',
    name: 'Salpicão de Frango',
    description: 'Salpicão e muçarela. Serve 24 fatias.',
    price: 84.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'lm8',
    name: 'Light',
    description: 'Peito de peru e queijo minas. Serve 24 fatias.',
    price: 94.00,
    unit: '/unid',
    category: 'Lanches de Metro',
    image: 'https://images.unsplash.com/photo-1475090169767-40ed8d18f5d1?auto=format&fit=crop&w=800&q=80'
  },

  // --- DOCES ---
  {
    id: 'd1',
    name: 'Carolina',
    description: 'Limão, Doce de Leite ou Chocolate.',
    price: 95.00,
    unit: '/kg',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd2',
    name: 'Carolina Nutella',
    description: 'Recheada com Nutella pura.',
    price: 135.00,
    unit: '/kg',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1517433670267-31fc34cf5275?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd3',
    name: 'Mini Doces Festa',
    description: 'Beijinho, Brigadeiro.',
    price: 110.00,
    unit: '/kg',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd4',
    name: 'Doces Finos',
    description: 'Casadinho, Creme Brulee e Ninho c/ Nutella.',
    price: 120.00,
    unit: '/kg',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd5',
    name: 'Amor Perfeito',
    description: 'Massa de chocolate c/ Leite Moça.',
    price: 90.00,
    unit: '/kg',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd6',
    name: 'Micro Sonho',
    description: 'Clássico em miniatura.',
    price: 2.00,
    unit: '/unid',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'd7',
    name: 'Micro Tortinha',
    description: 'Limão ou Morango.',
    price: 5.00,
    unit: '/unid',
    category: 'Doces',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80'
  },

  // --- BOLOS CONFEITADOS (KG) ---
  {
    id: 'bc1',
    name: 'Sonho de Valsa',
    description: 'Bolo de chocolate com bombons.',
    price: 76.00,
    unit: '/kg',
    category: 'Bolos Confeitados',
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bc2',
    name: 'Ouro Branco',
    description: 'Bolo branco com bombons.',
    price: 79.00,
    unit: '/kg',
    category: 'Bolos Confeitados',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bc3',
    name: 'Creme de Morango',
    description: 'Morangos frescos e creme.',
    price: 75.00,
    unit: '/kg',
    category: 'Bolos Confeitados',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bc4',
    name: 'Ferrero Rocher',
    description: 'Sofisticado sabor de avelã.',
    price: 91.00,
    unit: '/kg',
    category: 'Bolos Confeitados',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bc5',
    name: 'Leite Ninho c/ Nutella',
    description: 'A combinação favorita.',
    price: 91.00,
    unit: '/kg',
    category: 'Bolos Confeitados',
    image: 'https://images.unsplash.com/photo-1588195538326-c5f1f934a794?auto=format&fit=crop&w=800&q=80'
  },

  // --- BOLOS CLÁSSICOS ---
  {
    id: 'bcl1',
    name: 'Bolos Caseiros',
    description: 'Cenoura, Fubá, Laranja, Limão, Milho e mais.',
    price: 25.00, // Preço médio para exibição, "Consulte"
    unit: '/unid',
    category: 'Bolos Clássicos',
    image: 'https://images.unsplash.com/photo-1559842606-25f00e99496f?auto=format&fit=crop&w=800&q=80'
  },

  // --- TÁBUAS ---
  {
    id: 'tb1',
    name: 'Tábua de Frios (P)',
    description: 'Serve até 10 pessoas (1,2kg). Queijos e embutidos variados.',
    price: 120.00,
    unit: '/unid',
    category: 'Tábuas de Frios',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tb2',
    name: 'Tábua de Frios (M)',
    description: 'Serve até 20 pessoas (1,7kg).',
    price: 150.00,
    unit: '/unid',
    category: 'Tábuas de Frios',
    image: 'https://images.unsplash.com/photo-1628198089953-d142b78129cc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tb3',
    name: 'Tábua de Frios (G)',
    description: 'Serve até 30 pessoas (2,2kg).',
    price: 180.00,
    unit: '/unid',
    category: 'Tábuas de Frios',
    image: 'https://images.unsplash.com/photo-1605333396915-47ed6b75a5e3?auto=format&fit=crop&w=800&q=80'
  },

  // --- CESTAS ---
  {
    id: 'ct1',
    name: 'Cesta Entrelaçada',
    description: 'Massa de pão com mix de pães incluso.',
    price: 130.00,
    unit: '/unid',
    category: 'Cestas de Pães',
    image: 'https://images.unsplash.com/photo-1596450514735-256fa0842247?auto=format&fit=crop&w=800&q=80'
  }
];
