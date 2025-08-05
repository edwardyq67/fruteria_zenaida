import { create } from 'zustand';

// Interfaz para los productos en el pedido
interface ProductoPedido {
  id: string;
  nombre: string;
  categoria: 'fruta' | 'verdura' | 'otros';
  precio: number;
  cantidad: number;
  unidad: 'kg' | 'unidad' | 'litro' | 'caja'; // Tipos de unidades
}

// Interfaz para la Boleta
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
  pedido: ProductoPedido[]; // Cambiado de products a pedido
  total: number; // Solo total sin IVA
}

// Estado del store
interface BoletaState {
  boletas: Boleta[];
  addBoleta: (boleta: Omit<Boleta, 'id' | 'total'>) => void;
  deleteBoleta: (id: string) => void;
  updateBoleta: (boleta: Boleta) => void;
  getBoletaById: (id: string) => Boleta | undefined;
  calcularTotal: (pedido: ProductoPedido[]) => number;
}

// Datos iniciales de ejemplo
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
    pedido: [
      { 
        id: '1', 
        nombre: 'Manzana', 
        categoria: 'fruta', 
        precio: 1.50, 
        cantidad: 2, 
        unidad: 'kg' 
      },
      { 
        id: '2', 
        nombre: 'Lechuga', 
        categoria: 'verdura', 
        precio: 0.99, 
        cantidad: 3, 
        unidad: 'unidad' 
      },
    ],
    total: 5.97 // 1.50*2 + 0.99*3
  }
];

// Implementación del store
export const useBoletaStore = create<BoletaState>((set, get) => ({
  boletas: initialBoletas,
  
  addBoleta: (boleta) => {
    const total = get().calcularTotal(boleta.pedido);
    const newId = `B${String(get().boletas.length + 1).padStart(3, '0')}`;
    
    set((state) => ({
      boletas: [...state.boletas, { 
        ...boleta, 
        id: newId,
        total 
      }],
    }));
  },
  
  deleteBoleta: (id) => {
    set((state) => ({
      boletas: state.boletas.filter((boleta) => boleta.id !== id),
    }));
  },
  
  updateBoleta: (updatedBoleta) => {
    const total = get().calcularTotal(updatedBoleta.pedido);
    set((state) => ({
      boletas: state.boletas.map((boleta) =>
        boleta.id === updatedBoleta.id 
          ? { ...updatedBoleta, total } 
          : boleta
      ),
    }));
  },
  
  getBoletaById: (id) => {
    return get().boletas.find((boleta) => boleta.id === id);
  },
  
  calcularTotal: (pedido) => {
    const total = pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return parseFloat(total.toFixed(2));
  }
}));

// Exportar tipos
export type { Boleta, ProductoPedido };