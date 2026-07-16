"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_PRODUCT, GET_PRODUCTS, REMOVE_PRODUCT } from "@/lib/graphql/products";
import type { Product } from "@/lib/graphql/types";

export default function ProductsPage() {
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  const { data, loading, refetch } = useQuery<{ getProducts: { products: Product[] | null } }>(GET_PRODUCTS);
  const [createProduct, createState] = useMutation(CREATE_PRODUCT);
  const [removeProduct, removeState] = useMutation(REMOVE_PRODUCT);

  const products = data?.getProducts?.products ?? [];

  const handleCreate = async () => {
    const { data: result } = await createProduct({
      variables: {
        product: {
          name: form.name,
          description: form.description,
          price: Number(form.price.replace(",", ".")),
        },
      },
    });
    if (result?.createProduct?.success) {
      toast("Producto creado");
      setForm({ name: "", description: "", price: "" });
      setCreating(false);
      refetch();
    } else {
      toast(result?.createProduct?.message ?? "No se pudo crear", "error");
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    const { data: result } = await removeProduct({ variables: { ids: [removing.id] } });
    if (result?.removeProduct?.success) {
      toast("Producto eliminado");
      refetch();
    } else {
      toast(result?.removeProduct?.message ?? "No se pudo eliminar", "error");
    }
    setRemoving(null);
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Producto",
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.pictures?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.pictures[0].url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <span className="h-10 w-10 rounded-lg border border-zinc-100 bg-zinc-50" />
          )}
          <div>
            <p className="font-medium text-zinc-900">{product.name}</p>
            <p className="max-w-md truncate text-xs text-zinc-400">{product.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Precio",
      // El precio de producto va en euros (la app móvil muestra `{price}€` tal cual)
      render: (product) => <span className="tabular-nums text-zinc-700">{product.price.toFixed(2).replace(".", ",")} €</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (product) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setRemoving(product);
          }}
          className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Eliminar producto"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Tienda de la empresa"
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} strokeWidth={1.5} />
            Nuevo producto
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={products}
        rowKey={(product) => product.id}
        loading={loading}
        emptyMessage="Aún no hay productos en la tienda"
      />

      <SlideOver
        open={creating}
        onClose={() => setCreating(false)}
        title="Nuevo producto"
        subtitle="La imagen se puede añadir después desde la app"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createState.loading || !form.name || !form.description || !form.price}
            >
              {createState.loading ? "Creando…" : "Crear producto"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Nombre">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
          <Field label="Precio (€)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
          </Field>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Eliminar producto"
        description={`Se eliminará "${removing?.name}" de la tienda.`}
        confirmLabel="Eliminar"
        danger
        loading={removeState.loading}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
