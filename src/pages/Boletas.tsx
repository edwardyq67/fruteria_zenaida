import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/generic-data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';

import { useBoletaStore } from '@/lib/boletaStore';
import type { Boleta } from '@/lib/boletaStore';
import { useProductStore } from '@/lib/productStore';
import type { Product } from '@/lib/productStore';
import { type ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for boleta creation
const createBoletaSchema = z.object({
  cliente: z.string().min(1, "El cliente es requerido"),
  nombreIdentidad: z.string().min(1, "El nombre de identidad es requerido"),
  ruc: z.string().min(1, "El RUC es requerido"),
  fechaEmision: z.string().min(1, "La fecha de emisión es requerida"),
  fechaTraslado: z.string().min(1, "La fecha de traslado es requerida"),
  transporteMarca: z.string().min(1, "La marca de transporte es requerida"),
  transportePlaca: z.string().min(1, "La placa de transporte es requerida"),
  numConstInscripcion: z.string().min(1, "El número de const. inscripción es requerido"),
  licenciaConducir: z.string().min(1, "La licencia de conducir es requerida"),
  // products will be handled separately as they are dynamic
});

type CreateBoletaFormData = z.infer<typeof createBoletaSchema>;

// Zod schema for boleta editing
const editBoletaSchema = z.object({
  cliente: z.string().min(1, "El cliente es requerido"),
  nombreIdentidad: z.string().min(1, "El nombre de identidad es requerido"),
  ruc: z.string().min(1, "El RUC es requerido"),
  fechaEmision: z.string().min(1, "La fecha de emisión es requerida"),
  fechaTraslado: z.string().min(1, "La fecha de traslado es requerida"),
  transporteMarca: z.string().min(1, "La marca de transporte es requerida"),
  transportePlaca: z.string().min(1, "La placa de transporte es requerida"),
  numConstInscripcion: z.string().min(1, "El número de const. inscripción es requerido"),
  licenciaConducir: z.string().min(1, "La licencia de conducir es requerida"),
  // products will be handled separately as they are dynamic
});

type EditBoletaFormData = z.infer<typeof editBoletaSchema>;

export function Boletas() {
  
  const boletas = useBoletaStore((state) => state.boletas);
  const addBoleta = useBoletaStore((state) => state.addBoleta);
  const deleteBoleta = useBoletaStore((state) => state.deleteBoleta);
  const updateBoleta = useBoletaStore((state) => state.updateBoleta);

  const allProducts = useProductStore((state) => state.products); // Get all products for selection

  const [filterCliente, setFilterCliente] = useState('');
  const [filterRUC, setFilterRUC] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingBoleta, setEditingBoleta] = useState<Boleta | null>(null);
  const [detailsBoleta, setDetailsBoleta] = useState<Boleta | null>(null);

  // States for products within the new boleta form
  const [newBoletaProducts, setNewBoletaProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  

  // React Hook Form for Create Boleta
  const { register: registerCreate, handleSubmit: handleSubmitCreate, formState: { errors: errorsCreate }, reset: resetCreateForm } = useForm<CreateBoletaFormData>({
    resolver: zodResolver(createBoletaSchema),
  });

  // React Hook Form for Edit Boleta
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, reset: resetEditForm } = useForm<EditBoletaFormData>({
    resolver: zodResolver(editBoletaSchema),
  });

  // Effect to reset edit form when editingBoleta changes
  useEffect(() => {
    if (editingBoleta) {
      resetEditForm({
        cliente: editingBoleta.cliente,
        nombreIdentidad: editingBoleta.nombreIdentidad,
        ruc: editingBoleta.ruc,
        fechaEmision: editingBoleta.fechaEmision,
        fechaTraslado: editingBoleta.fechaTraslado,
        transporteMarca: editingBoleta.transporteMarca,
        transportePlaca: editingBoleta.transportePlaca,
        numConstInscripcion: editingBoleta.numConstInscripcion,
        licenciaConducir: editingBoleta.licenciaConducir,
      });
      setNewBoletaProducts(editingBoleta.products); // Load products for editing
    }
  }, [editingBoleta, resetEditForm]);

  const filteredBoletas = boletas.filter((boleta) => {
    const matchesCliente = boleta.cliente.toLowerCase().includes(filterCliente.toLowerCase());
    const matchesRUC = boleta.ruc.toLowerCase().includes(filterRUC.toLowerCase());
    return matchesCliente && matchesRUC;
  });

  const handleAddProductToNewBoleta = () => {
    const productToAdd = allProducts.find(p => p.id === selectedProductId);
    if (productToAdd) {
      setNewBoletaProducts(prev => {
        const existingProductIndex = prev.findIndex(p => p.id === productToAdd.id);
        if (existingProductIndex > -1) {
          return prev; // Product already exists, do not add again
        } else {
          return [...prev, productToAdd];
        }
      });
      setSelectedProductId('');
    }
  };

  const handleRemoveProductFromNewBoleta = (productId: string) => {
    setNewBoletaProducts(prev => prev.filter(p => p.id !== productId));
  };

  const onCreateSubmit = (data: CreateBoletaFormData) => {
    if (newBoletaProducts.length === 0) {
      alert("Debe agregar al menos un producto a la boleta.");
      return;
    }
    const newBoleta: Boleta = {
      id: `B${String(boletas.length + 1).padStart(3, '0')}`,
      cliente: data.cliente,
      nombreIdentidad: data.nombreIdentidad,
      ruc: data.ruc,
      fechaEmision: data.fechaEmision,
      fechaTraslado: data.fechaTraslado,
      transporteMarca: data.transporteMarca,
      transportePlaca: data.transportePlaca,
      numConstInscripcion: data.numConstInscripcion,
      licenciaConducir: data.licenciaConducir,
      products: newBoletaProducts,
    };
    addBoleta(newBoleta);
    resetCreateForm();
    setNewBoletaProducts([]);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteBoleta = (id: string) => {
    deleteBoleta(id);
  };

  const handleEditBoleta = (boleta: Boleta) => {
    setEditingBoleta(boleta);
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = (data: EditBoletaFormData) => {
    if (editingBoleta) {
      const updatedBoleta: Boleta = {
        ...editingBoleta,
        cliente: data.cliente,
        nombreIdentidad: data.nombreIdentidad,
        ruc: data.ruc,
        fechaEmision: data.fechaEmision,
        fechaTraslado: data.fechaTraslado,
        transporteMarca: data.transporteMarca,
        transportePlaca: data.transportePlaca,
        numConstInscripcion: data.numConstInscripcion,
        licenciaConducir: data.licenciaConducir,
        products: newBoletaProducts, // Use newBoletaProducts for edited products
      };
      updateBoleta(updatedBoleta);
      setEditingBoleta(null);
      setNewBoletaProducts([]); // Clear products after editing
      setIsEditDialogOpen(false);
    }
  };

  const handleViewDetailsBoleta = (boleta: Boleta) => {
    setDetailsBoleta(boleta);
    setIsDetailsDialogOpen(true);
  };

  const boletaColumns: ColumnDef<Boleta>[] = [
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => row.getValue("cliente"),
    },
    {
      accessorKey: "nombreIdentidad",
      header: "Nombre de Identidad",
      cell: ({ row }) => row.getValue("nombreIdentidad"),
    },
    {
      accessorKey: "ruc",
      header: "RUC",
      cell: ({ row }) => row.getValue("ruc"),
    },
    {
      accessorKey: "fechaEmision",
      header: "Fecha de Emisión",
      cell: ({ row }) => row.getValue("fechaEmision"),
    },
    {
      accessorKey: "fechaTraslado",
      header: "Fecha de Traslado",
      cell: ({ row }) => row.getValue("fechaTraslado"),
    },
    {
      accessorKey: "transporteMarca",
      header: "Marca Transporte",
      cell: ({ row }) => row.getValue("transporteMarca"),
    },
    {
      accessorKey: "transportePlaca",
      header: "Placa Transporte",
      cell: ({ row }) => row.getValue("transportePlaca"),
    },
    {
      accessorKey: "numConstInscripcion",
      header: "Nº Const. Inscripción",
      cell: ({ row }) => row.getValue("numConstInscripcion"),
    },
    {
      accessorKey: "licenciaConducir",
      header: "Licencia de Conducir",
      cell: ({ row }) => row.getValue("licenciaConducir"),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const boleta = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditBoleta(boleta)}>Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewDetailsBoleta(boleta)}>Ver Detalles</DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Eliminar</DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente
                      la boleta {boleta.id}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteBoleta(boleta.id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Boletas</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Boleta</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Boleta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="grid grid-cols-2 gap-4 py-4">
              {/* Sección 1: Cliente e Identidad */}
              <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                <h2 className="col-span-2 text-lg font-semibold">Datos del Cliente</h2>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaCliente">Cliente</Label>
                  <Input id="newBoletaCliente" {...registerCreate("cliente")} />
                  {errorsCreate.cliente && <p className="text-red-500 text-sm">{errorsCreate.cliente.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaNombreIdentidad">Nombre de Identidad</Label>
                  <Input id="newBoletaNombreIdentidad" {...registerCreate("nombreIdentidad")} />
                  {errorsCreate.nombreIdentidad && <p className="text-red-500 text-sm">{errorsCreate.nombreIdentidad.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaRUC">RUC</Label>
                  <Input id="newBoletaRUC" {...registerCreate("ruc")} />
                  {errorsCreate.ruc && <p className="text-red-500 text-sm">{errorsCreate.ruc.message}</p>}
                </div>
              </div>

              {/* Sección 2: Fechas */}
              <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                <h2 className="col-span-2 text-lg font-semibold">Fechas</h2>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaFechaEmision">Fecha de Emisión</Label>
                  <Input id="newBoletaFechaEmision" type="date" {...registerCreate("fechaEmision")} />
                  {errorsCreate.fechaEmision && <p className="text-red-500 text-sm">{errorsCreate.fechaEmision.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaFechaTraslado">Fecha de Traslado</Label>
                  <Input id="newBoletaFechaTraslado" type="date" {...registerCreate("fechaTraslado")} />
                  {errorsCreate.fechaTraslado && <p className="text-red-500 text-sm">{errorsCreate.fechaTraslado.message}</p>}
                </div>
              </div>

              {/* Sección 3: Transporte */}
              <div className="col-span-2 grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                <h2 className="col-span-2 text-lg font-semibold">Datos de Transporte</h2>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaTransporteMarca">Marca Transporte</Label>
                  <Input id="newBoletaTransporteMarca" {...registerCreate("transporteMarca")} />
                  {errorsCreate.transporteMarca && <p className="text-red-500 text-sm">{errorsCreate.transporteMarca.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaTransportePlaca">Placa Transporte</Label>
                  <Input id="newBoletaTransportePlaca" {...registerCreate("transportePlaca")} />
                  {errorsCreate.transportePlaca && <p className="text-red-500 text-sm">{errorsCreate.transportePlaca.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaNumConstInscripcion">Nº Const. Inscripción</Label>
                  <Input id="newBoletaNumConstInscripcion" {...registerCreate("numConstInscripcion")} />
                  {errorsCreate.numConstInscripcion && <p className="text-red-500 text-sm">{errorsCreate.numConstInscripcion.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newBoletaLicenciaConducir">Licencia de Conducir</Label>
                  <Input id="newBoletaLicenciaConducir" {...registerCreate("licenciaConducir")} />
                  {errorsCreate.licenciaConducir && <p className="text-red-500 text-sm">{errorsCreate.licenciaConducir.message}</p>}
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
                  
                  <Button type="button" onClick={handleAddProductToNewBoleta} className="mt-auto">Agregar Producto</Button>
                </div>

                {newBoletaProducts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium mb-2">Productos Agregados:</h3>
                    <ul className="list-disc pl-5">
                      {newBoletaProducts.map(p => (
                        <li key={p.id}>{p.name} - ${p.price.toFixed(2)}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveProductFromNewBoleta(p.id)}
                          >
                            Eliminar
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter className="col-span-2">
                <Button type="submit">Guardar Boleta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="filterCliente" className="block text-sm font-medium text-gray-700">Filtrar por Cliente</label>
          <Input
            id="filterCliente"
            type="text"
            placeholder="Buscar por cliente..."
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="filterRUC" className="block text-sm font-medium text-gray-700">Filtrar por RUC</label>
          <Input
            id="filterRUC"
            type="text"
            placeholder="Buscar por RUC..."
            value={filterRUC}
            onChange={(e) => setFilterRUC(e.target.value)}
          />
        </div>
      </div>

      <GenericDataTable columns={boletaColumns} data={filteredBoletas} filterColumnId="cliente" filterPlaceholder="Filtrar por Cliente" />

      {/* Edit Boleta Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Boleta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="grid grid-cols-2 gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editBoletaCliente">Cliente</Label>
              <Input id="editBoletaCliente" {...registerEdit("cliente")} />
              {errorsEdit.cliente && <p className="text-red-500 text-sm">{errorsEdit.cliente.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaNombreIdentidad">Nombre de Identidad</Label>
              <Input id="editBoletaNombreIdentidad" {...registerEdit("nombreIdentidad")} />
              {errorsEdit.nombreIdentidad && <p className="text-red-500 text-sm">{errorsEdit.nombreIdentidad.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaRUC">RUC</Label>
              <Input id="editBoletaRUC" {...registerEdit("ruc")} />
              {errorsEdit.ruc && <p className="text-red-500 text-sm">{errorsEdit.ruc.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaFechaEmision">Fecha de Emisión</Label>
              <Input id="editBoletaFechaEmision" type="date" {...registerEdit("fechaEmision")} />
              {errorsEdit.fechaEmision && <p className="text-red-500 text-sm">{errorsEdit.fechaEmision.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaFechaTraslado">Fecha de Traslado</Label>
              <Input id="editBoletaFechaTraslado" type="date" {...registerEdit("fechaTraslado")} />
              {errorsEdit.fechaTraslado && <p className="text-red-500 text-sm">{errorsEdit.fechaTraslado.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaTransporteMarca">Marca Transporte</Label>
              <Input id="editBoletaTransporteMarca" {...registerEdit("transporteMarca")} />
              {errorsEdit.transporteMarca && <p className="text-red-500 text-sm">{errorsEdit.transporteMarca.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaTransportePlaca">Placa Transporte</Label>
              <Input id="editBoletaTransportePlaca" {...registerEdit("transportePlaca")} />
              {errorsEdit.transportePlaca && <p className="text-red-500 text-sm">{errorsEdit.transportePlaca.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaNumConstInscripcion">Nº Const. Inscripción</Label>
              <Input id="editBoletaNumConstInscripcion" {...registerEdit("numConstInscripcion")} />
              {errorsEdit.numConstInscripcion && <p className="text-red-500 text-sm">{errorsEdit.numConstInscripcion.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editBoletaLicenciaConducir">Licencia de Conducir</Label>
              <Input id="editBoletaLicenciaConducir" {...registerEdit("licenciaConducir")} />
              {errorsEdit.licenciaConducir && <p className="text-red-500 text-sm">{errorsEdit.licenciaConducir.message}</p>}
            </div>
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="editBoletaProducts">Productos</Label>
              <select
                id="editBoletaProducts"
                multiple
                value={newBoletaProducts.map(p => p.id)} // Use newBoletaProducts for edit form as well
                onChange={(e) => {
                  const selectedProductIds = Array.from(e.target.selectedOptions, option => option.value);
                  setNewBoletaProducts(allProducts.filter(p => selectedProductIds.includes(p.id)));
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {allProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name} (${product.price.toFixed(2)})</option>
                ))}
              </select>
            </div>
            <DialogFooter className="col-span-2">
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de Boleta: {detailsBoleta?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {detailsBoleta && (
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Cliente:</strong> {detailsBoleta.cliente}</p>
                <p><strong>Nombre de Identidad:</strong> {detailsBoleta.nombreIdentidad}</p>
                <p><strong>RUC:</strong> {detailsBoleta.ruc}</p>
                <p><strong>Fecha de Emisión:</strong> {detailsBoleta.fechaEmision}</p>
                <p><strong>Fecha de Traslado:</strong> {detailsBoleta.fechaTraslado}</p>
                <p><strong>Marca Transporte:</strong> {detailsBoleta.transporteMarca}</p>
                <p><strong>Placa Transporte:</strong> {detailsBoleta.transportePlaca}</p>
                <p><strong>Nº Const. Inscripción:</strong> {detailsBoleta.numConstInscripcion}</p>
                <p><strong>Licencia de Conducir:</strong> {detailsBoleta.licenciaConducir}</p>
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mt-4 mb-2">Productos en esta Boleta:</h3>
                  {detailsBoleta.products.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {detailsBoleta.products.map(product => (
                        <li key={product.id}>{product.name} - ${product.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay productos asociados a esta boleta.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
