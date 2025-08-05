import { create } from 'zustand';
import type { Product } from './productStore';

// 1. Exporta la interfaz Boleta
export interface Boleta {
  id: string;
  cliente: string;
  nombreIdentidad: string;
  ruc: string;
  fechaEmision: string;
  fechaTraslado: string;
  transporteMarca: string;
  transportePlaca: string;
  numConstInscripcion: string;
  licenciaConducir: string;
  products: Product[];
}

// 2. Exporta el tipo del estado del store
export interface BoletaState {
  boletas: Boleta[];
  addBoleta: (boleta: Omit<Boleta, 'id'>) => void; // No requiere id (se genera automático)
  deleteBoleta: (id: string) => void;
  updateBoleta: (boleta: Boleta) => void;
  getBoletaById: (id: string) => Boleta | undefined;
}

// 3. Datos iniciales (pueden ser exportados si se necesitan en otros lugares)
const initialBoletas: Boleta[] = [
  {
    id: 'B001',
    cliente: 'Cliente A',
    nombreIdentidad: 'Juan Perez',
    ruc: '12345678901',
    fechaEmision: '2025-08-01',
    fechaTraslado: '2025-08-02',
    transporteMarca: 'Toyota',
    transportePlaca: 'ABC-123',
    numConstInscripcion: 'CI-001',
    licenciaConducir: 'L-001',
    products: [
      { id: '1', category: 'fruta', name: 'Manzana', price: 1.50 },
      { id: '2', category: 'verdura', name: 'Lechuga', price: 0.99 },
    ],
  },
  {
    id: 'B002',
    cliente: 'Cliente B',
    nombreIdentidad: 'Maria Lopez',
    ruc: '98765432109',
    fechaEmision: '2025-08-03',
    fechaTraslado: '2025-08-04',
    transporteMarca: 'Nissan',
    transportePlaca: 'XYZ-789',
    numConstInscripcion: 'CI-002',
    licenciaConducir: 'L-002',
    products: [
      { id: '3', category: 'fruta', name: 'Plátano', price: 0.75 },
    ],
  },
];
export interface Boleta {
  id: string;
  cliente: string;
  nombreIdentidad: string;
  ruc: string;
  fechaEmision: string;
  fechaTraslado: string;
  transporteMarca: string;
  transportePlaca: string;
  numConstInscripcion: string;
  licenciaConducir: string;
  products: Product[];
}
// 4. Exporta el store con todas las acciones
export const useBoletaStore = create<BoletaState>((set, get) => ({
  boletas: initialBoletas,
  
  addBoleta: (boleta) => {
    const newId = `B${String(get().boletas.length + 1).padStart(3, '0')}`;
    set((state) => ({
      boletas: [...state.boletas, { ...boleta, id: newId }],
    }));
  },
  
  deleteBoleta: (id) => {
    set((state) => ({
      boletas: state.boletas.filter((boleta) => boleta.id !== id),
    }));
  },
  
  updateBoleta: (updatedBoleta) => {
    set((state) => ({
      boletas: state.boletas.map((boleta) =>
        boleta.id === updatedBoleta.id ? updatedBoleta : boleta
      ),
    }));
  },
  
  getBoletaById: (id) => {
    return get().boletas.find((boleta) => boleta.id === id);
  },
}));

// 5. Exporta tipos adicionales si es necesario
export type { Product } from './productStore';