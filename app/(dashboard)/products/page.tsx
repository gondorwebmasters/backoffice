"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { PageShell } from "@/components/ui/sticky-header";
import { SlideOver } from "@/components/ui/slide-over";
import { useToast } from "@/components/ui/toast";
import { CREATE_PRODUCT, GET_PRODUCTS, REMOVE_PRODUCT } from "@/lib/graphql/products";
import type { Product } from "@/lib/graphql/types";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const t = useTranslations("products");
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [page, setPage] = useState(0);

  const { data, loading, refetch } = useQuery<{ getProducts: { products: Product[] | null } }>(GET_PRODUCTS);
  const [createProduct, createState] = useMutation(CREATE_PRODUCT);
  const [removeProduct, removeState] = useMutation(REMOVE_PRODUCT);

  const allProducts = data?.getProducts?.products ?? [];
  const pageCount = Math.max(Math.ceil(allProducts.length / PAGE_SIZE), 1);
  const products = allProducts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

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
      toast(t("created"));
      setForm({ name: "", description: "", price: "" });
      setCreating(false);
      refetch();
    } else {
      toast(result?.createProduct?.message ?? t("createFailed"), "error");
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    const { data: result } = await removeProduct({ variables: { ids: [removing.id] } });
    if (result?.removeProduct?.success) {
      toast(t("removed"));
      refetch();
    } else {
      toast(result?.removeProduct?.message ?? t("removeFailed"), "error");
    }
    setRemoving(null);
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: t("columns.product"),
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
      header: t("columns.price"),
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
          title={t("deleteProduct")}
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageShell
        header={
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actions={
              <Button variant="primary" onClick={() => setCreating(true)}>
                <Plus size={15} strokeWidth={1.5} />
                {t("newProduct")}
              </Button>
            }
          />
        }
      >
        <DataTable
          columns={columns}
          rows={products}
          rowKey={(product) => product.id}
          loading={loading}
          emptyMessage={t("emptyTable")}
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={t("totalLabel", { count: allProducts.length })} />
      </PageShell>

      <SlideOver
        open={creating}
        onClose={() => setCreating(false)}
        title={t("newProduct")}
        subtitle={t("createSubtitle")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={createState.loading || !form.name || !form.description || !form.price}
            >
              {createState.loading ? t("creating") : t("createProduct")}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label={t("name")}>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label={t("description")}>
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
          <Field label={t("price")}>
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
        title={t("deleteProduct")}
        description={t("deleteConfirmDescription", { name: removing?.name ?? "" })}
        confirmLabel={t("delete")}
        danger
        loading={removeState.loading}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}
