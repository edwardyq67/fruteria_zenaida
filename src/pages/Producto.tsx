import React, { useState } from 'react';
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
import { useProductStore, Product } from '@/lib/productStore';

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

  // Form states for new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'fruta' | 'verdura'>('fruta');
  const [newProductPrice, setNewProductPrice] = useState<string>('');

  // Form states for editing product
  const [editProductName, setEditProductName] = useState('');
  const [editProductCategory, setEditProductCategory] = useState<'fruta' | 'verdura'>('fruta');
  const [editProductPrice, setEditProductPrice] = useState<string>('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesMinPrice = minPriceFilter === '' || product.price >= parseFloat(minPriceFilter);
    const matchesMaxPrice = maxPriceFilter === '' || product.price <= parseFloat(maxPriceFilter);

    return matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  const handleCreateProduct = () => {
    if (newProductName && newProductPrice) {
      const newProduct: Product = {
        id: String(products.length + 1), // Simple ID generation, will be handled by store
        category: newProductCategory,
        name: newProductName,
        price: parseFloat(newProductPrice),
      };
      addProduct(newProduct); // Use store action
      // Clear form fields
      setNewProductName('');
      setNewProductPrice('');
      setNewProductCategory('fruta');
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id); // Use store action
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductCategory(product.category);
    setEditProductPrice(String(product.price));
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedProduct = () => {
    if (editingProduct && editProductName && editProductPrice) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: editProductName,
        category: editProductCategory,
        price: parseFloat(editProductPrice),
      };
      updateProduct(updatedProduct); // Use store action
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="newProductName"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductCategory" className="text-right">
                  Categoría
                </Label>
                <select
                  id="newProductCategory"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as 'fruta' | 'verdura')}
                  className="col-span-3 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="fruta">Fruta</option>
                  <option value="verdura">Verdura</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductPrice" className="text-right">
                  Precio
                </Label>
                <Input
                  id="newProductPrice"
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateProduct}>Guardar Producto</Button>
            </DialogFooter>
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductName" className="text-right">
                Nombre
              </Label>
              <Input
                id="editProductName"
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductCategory" className="text-right">
                Categoría
              </Label>
              <select
                id="editProductCategory"
                value={editProductCategory}
                onChange={(e) => setEditProductCategory(e.target.value as 'fruta' | 'verdura')}
                className="col-span-3 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="fruta">Fruta</option>
                <option value="verdura">Verdura</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProductPrice" className="text-right">
                Precio
              </Label>
              <Input
                id="editProductPrice"
                type="number"
                value={editProductPrice}
                onChange={(e) => setEditProductPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveEditedProduct}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}