import { create } from 'zustand';

export interface Product {
  id: string;
  category: 'fruta' | 'verdura';
  name: string;
  price: number;
}

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (product: Product) => void;
}

const initialProducts: Product[] = [
  { id: '1', category: 'fruta', name: 'Manzana', price: 1.50 },
  { id: '2', category: 'verdura', name: 'Lechuga', price: 0.99 },
  { id: '3', category: 'fruta', name: 'Plátano', price: 0.75 },
  { id: '4', category: 'verdura', name: 'Tomate', price: 2.20 },
  { id: '5', category: 'fruta', name: 'Naranja', price: 1.20 },
];

export const useProductStore = create<ProductState>((set) => ({
  products: initialProducts,
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, { ...product, id: String(state.products.length + 1) }],
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    })),
}));
