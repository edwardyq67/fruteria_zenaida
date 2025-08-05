import { create } from 'zustand';
import { Product } from './productStore'; // Import Product interface

interface Boleta {
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
  products: Product[]; // Array of products in this boleta
}

interface BoletaState {
  boletas: Boleta[];
  addBoleta: (boleta: Boleta) => void;
  deleteBoleta: (id: string) => void;
  updateBoleta: (boleta: Boleta) => void;
}

const initialBoletas: Boleta[] = [
  // Sample data for testing
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

export const useBoletaStore = create<BoletaState>((set) => ({
  boletas: initialBoletas,
  addBoleta: (boleta) =>
    set((state) => ({
      boletas: [...state.boletas, { ...boleta, id: `B${String(state.boletas.length + 1).padStart(3, '0')}` }],
    })),
  deleteBoleta: (id) =>
    set((state) => ({
      boletas: state.boletas.filter((boleta) => boleta.id !== id),
    })),
  updateBoleta: (updatedBoleta) =>
    set((state) => ({
      boletas: state.boletas.map((boleta) =>
        boleta.id === updatedBoleta.id ? updatedBoleta : boleta
      ),
    })),
}));
