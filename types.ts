
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., "/cento", "/unid", "/kg"
  category: Category;
  image?: string;
  image_url?: string;
}

export type Category =
  | 'Salgados Fritos'
  | 'Salgados Assados'
  | 'Lanches de Metro'
  | 'Mini Lanches'
  | 'Doces'
  | 'Bolos Confeitados'
  | 'Bolos Clássicos'
  | 'Tábuas de Frios'
  | 'Cestas de Pães';

export interface CartItem extends MenuItem {
  quantity: number;
}
