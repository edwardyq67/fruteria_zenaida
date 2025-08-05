import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable, columns } from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useProductStore } from '@/lib/productStore';
import type { Product } from '@/lib/productStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['fruta', 'verdura']),
  price: z.number()
    .min(0, 'El precio debe ser positivo')
    .refine(val => val !== undefined, {
      message: 'El precio es requerido'
    })
});

type CreateProductFormData = z.infer<typeof createProductSchema>;

// Zod schema for product editing (similar to creation, but might have different validation rules)
const editProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  category: z.union([z.literal("fruta"), z.literal("verdura")]),
  price: z.number().min(0, "El precio debe ser positivo"),
});


type EditProductFormData = z.infer<typeof editProductSchema>;

export function Producto() {
  const products = useProductStore((state) => state.products);
  const addProduct = useProductStore((state) => state.addProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);

  const [categoryFilter, setCategoryFilter] = useState<'' | 'fruta' | 'verdura'>( '');
  const [minPriceFilter, setMinPriceFilter] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // React Hook Form for Create Product
  const { register: registerCreate, handleSubmit: handleSubmitCreate, formState: { errors: errorsCreate }, reset: resetCreateForm } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      category: 'fruta',
      price: 0.01,
    },
  });

  // React Hook Form for Edit Product
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEditForm } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  // Effect to reset edit form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      resetEditForm({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
      });
    }
  }, [editingProduct, resetEditForm]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesMinPrice = minPriceFilter === '' || product.price >= parseFloat(minPriceFilter);
    const matchesMaxPrice = maxPriceFilter === '' || product.price <= parseFloat(maxPriceFilter);

    return matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  const onCreateSubmit = (data: CreateProductFormData) => {
    const newProduct: Product = {
      id: String(products.length + 1), // Simple ID generation
      category: data.category,
      name: data.name,
      price: data.price,
    };
    addProduct(newProduct);
    resetCreateForm(); // Clear form fields
    setIsCreateDialogOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: EditProductFormData) => {
    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: data.name,
        category: data.category,
        price: data.price,
      };
      updateProduct(updatedProduct);
      setEditingProduct(null);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Producto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="newProductName"
                  {...registerCreate("name")}
                  className="col-span-3"
                />
                {errorsCreate.name && <p className="col-span-4 text-red-500 text-sm">{errorsCreate.name.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductCategory" className="text-right">
                  Categoría
                </Label>
                <select
                  id="newProductCategory"
                  {...registerCreate("category")}
                  className="col-span-3 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="fruta">Fruta</option>
                  <option value="verdura">Verdura</option>
                </select>
                {errorsCreate.category && <p className="col-span-4 text-red-500 text-sm">{errorsCreate.category.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductPrice" className="text-right">
                  Precio
                </Label>
                <Input
                  id="newProductPrice"
                  type="number"
                  step="0.01"
                  {...registerCreate("price")}
                  className="col-span-3"
                />
                {errorsCreate.price && <p className="col-span-4 text-red-500 text-sm">{errorsCreate.price.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit">Guardar Producto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as '' | 'fruta' | 'verdura')}
          >
            <option value="">Todas</option>
            <option value="fruta">Fruta</option>
            <option value="verdura">Verdura</option>
          </select>
        </div>
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Precio Mín.</label>
          <Input
            id="minPrice"
            type="number"
            placeholder="Mínimo..."
            value={minPriceFilter}
            onChange={(e) => setMinPriceFilter(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Precio Máx.</label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Máximo..."
            value={maxPriceFilter}
            onChange={(e) => setMaxPriceFilter(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductName" className="text-right">
                Nombre
              </Label>
              <Input
                id="editProductName"
                {...registerEdit("name")}
                className="col-span-3"
              />
              {errorsEdit.name && <p className="col-span-4 text-red-500 text-sm">{errorsEdit.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductCategory" className="text-right">
                Categoría
              </Label>
              <select
                id="editProductCategory"
                {...registerEdit("category")}
                className="col-span-3 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="fruta">Fruta</option>
                <option value="verdura">Verdura</option>
              </select>
              {errorsEdit.category && <p className="col-span-4 text-red-500 text-sm">{errorsEdit.category.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductPrice" className="text-right">
                Precio
              </Label>
              <Input
                id="editProductPrice"
                type="number"
                step="0.01"
                {...registerEdit("price")}
                className="col-span-3"
              />
              {errorsEdit.price && <p className="col-span-4 text-red-500 text-sm">{errorsEdit.price.message}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
