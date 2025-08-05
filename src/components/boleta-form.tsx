import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useProductStore } from '@/lib/productStore';
import type { Product } from '@/lib/productStore';
import type { Boleta, ProductoPedido } from '@/lib/boletaStore';

// Zod schema for boleta form
const boletaFormSchema = z.object({
  cliente: z.string().min(1, "El cliente es requerido"),
  nombreIdentidad: z.string().min(1, "El nombre de identidad es requerido"),
  ruc: z.string().min(1, "El RUC es requerido"),
  fechaEmision: z.string().min(1, "La fecha de emisión es requerida"),
  fechaTraslado: z.string().min(1, "La fecha de traslado es requerida"),
  transporteMarca: z.string().min(1, "La marca de transporte es requerida"),
  transportePlaca: z.string().min(1, "La placa de transporte es requerida"),
  numConstInscripcion: z.string().min(1, "El número de const. inscripción es requerido"),
  licenciaConducir: z.string().min(1, "La licencia de conducir es requerida"),
});

type BoletaFormData = z.infer<typeof boletaFormSchema>;

interface BoletaFormProps {
  initialData?: Boleta;
  onSubmit: (data: BoletaFormData, products: ProductoPedido[]) => void;
}

export function BoletaForm({ initialData, onSubmit }: BoletaFormProps) {
  const allProducts = useProductStore((state) => state.products);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQuantity, setSelectedProductQuantity] = useState<number>(1);
  const [selectedProductUnit, setSelectedProductUnit] = useState<'kg' | 'unidad' | 'litro' | 'caja'>('unidad');
  const [formProducts, setFormProducts] = useState<ProductoPedido[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BoletaFormData>({
    resolver: zodResolver(boletaFormSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setFormProducts(initialData.pedido || []);
    } else {
      reset();
      setFormProducts([]);
    }
  }, [initialData, reset]);

  const handleAddProduct = () => {
    const productToAdd = allProducts.find(p => p.id === selectedProductId);
    if (productToAdd && selectedProductQuantity > 0) {
      const newProductoPedido: ProductoPedido = {
        id: productToAdd.id,
        nombre: productToAdd.name,
        categoria: productToAdd.category,
        precio: productToAdd.price,
        cantidad: selectedProductQuantity,
        unidad: selectedProductUnit,
      };

      setFormProducts(prev => {
        const existingProductIndex = prev.findIndex(p => p.id === newProductoPedido.id);
        if (existingProductIndex > -1) {
          const updatedProducts = [...prev];
          updatedProducts[existingProductIndex] = {
            ...updatedProducts[existingProductIndex],
            cantidad: updatedProducts[existingProductIndex].cantidad + newProductoPedido.cantidad,
          };
          return updatedProducts;
        } else {
          return [...prev, newProductoPedido];
        }
      });
      setSelectedProductId('');
      setSelectedProductQuantity(1);
      setSelectedProductUnit('unidad');
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setFormProducts(prev => prev.filter(p => p.id !== productId));
  };

  const onSubmitHandler = (data: BoletaFormData) => {
    onSubmit(data, formProducts);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="grid grid-cols-2 max-h-[90vh] overflow-y-scroll gap-4 py-4">
      {/* Sección 1: Cliente e Identidad */}
      <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
        <h2 className="col-span-2 text-lg font-semibold">Datos del Cliente</h2>
        <div className="grid gap-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Input id="cliente" {...register("cliente")} />
          {errors.cliente && <p className="text-red-500 text-sm">{errors.cliente.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nombreIdentidad">Nombre de Identidad</Label>
          <Input id="nombreIdentidad" {...register("nombreIdentidad")} />
          {errors.nombreIdentidad && <p className="text-red-500 text-sm">{errors.nombreIdentidad.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ruc">RUC</Label>
          <Input id="ruc" {...register("ruc")} />
          {errors.ruc && <p className="text-red-500 text-sm">{errors.ruc.message}</p>}
        </div>
      </div>

      {/* Sección 2: Fechas */}
      <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
        <h2 className="col-span-2 text-lg font-semibold">Fechas</h2>
        <div className="grid gap-2">
          <Label htmlFor="fechaEmision">Fecha de Emisión</Label>
          <Input id="fechaEmision" type="date" {...register("fechaEmision")} />
          {errors.fechaEmision && <p className="text-red-500 text-sm">{errors.fechaEmision.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fechaTraslado">Fecha de Traslado</Label>
          <Input id="fechaTraslado" type="date" {...register("fechaTraslado")} />
          {errors.fechaTraslado && <p className="text-red-500 text-sm">{errors.fechaTraslado.message}</p>}
        </div>
      </div>

      {/* Sección 3: Transporte */}
      <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
        <h2 className="col-span-2 text-lg font-semibold">Datos de Transporte</h2>
        <div className="grid gap-2">
          <Label htmlFor="transporteMarca">Marca Transporte</Label>
          <Input id="transporteMarca" {...register("transporteMarca")} />
          {errors.transporteMarca && <p className="text-red-500 text-sm">{errors.transporteMarca.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transportePlaca">Placa Transporte</Label>
          <Input id="transportePlaca" {...register("transportePlaca")} />
          {errors.transportePlaca && <p className="text-red-500 text-sm">{errors.transportePlaca.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="numConstInscripcion">Nº Const. Inscripción</Label>
          <Input id="numConstInscripcion" {...register("numConstInscripcion")} />
          {errors.numConstInscripcion && <p className="text-red-500 text-sm">{errors.numConstInscripcion.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="licenciaConducir">Licencia de Conducir</Label>
          <Input id="licenciaConducir" {...register("licenciaConducir")} />
          {errors.licenciaConducir && <p className="text-red-500 text-sm">{errors.licenciaConducir.message}</p>}
        </div>
      </div>

      {/* Sección 4: Productos */}
      <div className="col-span-2 border-b pb-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Productos</h2>
        <div className="grid grid-cols-3 gap-2 items-end mb-4">
          <div className="grid gap-2">
            <Label htmlFor="productSelect">Producto</Label>
            <select
              id="productSelect"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Seleccionar Producto</option>
              {allProducts.map(product => (
                <option key={product.id} value={product.id}>{product.name} (${product.price.toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productQuantity">Cantidad</Label>
            <Input
              id="productQuantity"
              type="number"
              value={selectedProductQuantity}
              onChange={(e) => setSelectedProductQuantity(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productUnit">Unidad</Label>
            <select
              id="productUnit"
              value={selectedProductUnit}
              onChange={(e) => setSelectedProductUnit(e.target.value as 'kg' | 'unidad' | 'litro' | 'caja')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="kg">Kilogramo</option>
              <option value="unidad">Unidad</option>
              <option value="litro">Litro</option>
              <option value="caja">Caja</option>
            </select>
          </div>
          <Button type="button" onClick={handleAddProduct} className="mt-auto">Agregar Producto</Button>
        </div>

        {formProducts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Productos Agregados:</h3>
            <ul className="list-disc pl-5">
              {formProducts.map(p => (
                <li key={p.id}>{p.nombre} ({p.cantidad} {p.unidad}) - ${p.precio.toFixed(2)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveProduct(p.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="col-span-2 flex justify-end">
        <Button type="submit">Guardar Boleta</Button>
      </div>
    </form>
  );
}