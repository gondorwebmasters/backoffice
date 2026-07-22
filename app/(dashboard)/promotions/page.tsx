"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { PromotionForm } from "@/components/promotions/promotion-form";
import { BadgeDot } from "@/components/ui/badge-dot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { PageShell } from "@/components/ui/sticky-header";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { DELETE_PROMOTION, LIST_PROMOTIONS } from "@/lib/graphql/promotions";
import type { Promotion } from "@/lib/graphql/types";

function formatEuros(amount: number): string {
  return `${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function isExpired(promotion: Promotion): boolean {
  return new Date(promotion.expiresAt).getTime() <= Date.now();
}

const PAGE_SIZE = 10;

export default function PromotionsPage() {
  const toast = useToast();
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const [page, setPage] = useState(0);

  const { data, loading, refetch } = useQuery<{ getCompanyPromotions: { promotions: Promotion[] | null } }>(
    LIST_PROMOTIONS,
    { variables: { includeInactive: true } }
  );
  const [deletePromotion, deleteState] = useMutation(DELETE_PROMOTION);

  const allPromotions = data?.getCompanyPromotions?.promotions ?? [];
  const pageCount = Math.max(Math.ceil(allPromotions.length / PAGE_SIZE), 1);
  const promotions = allPromotions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleting) return;
    const { data: result } = await deletePromotion({ variables: { id: deleting.id } });
    if (result?.deletePromotion?.success) {
      toast("Promoción eliminada");
      refetch();
    } else {
      toast(result?.deletePromotion?.message ?? "No se pudo eliminar", "error");
    }
    setDeleting(null);
  };

  const columns: Column<Promotion>[] = [
    {
      key: "title",
      header: "Promoción",
      render: (promo) => (
        <div className="flex items-center gap-2">
          {promo.isHero ? <Star size={14} className="shrink-0 text-amber-500" fill="currentColor" /> : null}
          <div>
            <p className="font-medium text-zinc-900">{promo.title}</p>
            <p className="mt-0.5 max-w-md truncate text-xs text-zinc-400">{promo.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Descuento",
      render: (promo) => (
        <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">
          {promo.discountTag}
        </span>
      ),
    },
    {
      key: "pricing",
      header: "Precio",
      render: (promo) => (
        <span className="tabular-nums text-zinc-700">
          <span className="text-zinc-400 line-through">{formatEuros(promo.originalPrice)}</span>
          {" → "}
          <span className="font-medium text-zinc-900">{formatEuros(promo.newPrice)}</span>
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expira",
      render: (promo) => <span className="text-zinc-600">{formatDateTime(promo.expiresAt)}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (promo) =>
        !promo.isActive ? (
          <BadgeDot tone="muted" label="Inactiva" />
        ) : isExpired(promo) ? (
          <BadgeDot tone="neutral" label="Expirada" />
        ) : (
          <BadgeDot tone="positive" label="Activa" />
        ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (promo) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            setDeleting(promo);
          }}
          className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Eliminar promoción"
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
            title="Promociones"
            subtitle="Ofertas y descuentos exclusivos mostrados en la app"
            actions={
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={15} strokeWidth={1.5} />
                Nueva promoción
              </Button>
            }
          />
        }
      >
        <DataTable
          columns={columns}
          rows={promotions}
          rowKey={(promo) => promo.id}
          onRowClick={(promo) => {
            setEditing(promo);
            setFormOpen(true);
          }}
          loading={loading}
          emptyMessage="Aún no hay promociones creadas"
        />
        <Pagination page={page} pageCount={pageCount} onChange={setPage} totalLabel={`${allPromotions.length} promociones`} />
      </PageShell>

      <PromotionForm open={formOpen} promotion={editing} onClose={() => setFormOpen(false)} onSaved={() => refetch()} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar promoción"
        description={`La promoción "${deleting?.title}" se eliminará permanentemente y dejará de mostrarse en la app.`}
        confirmLabel="Eliminar"
        danger
        loading={deleteState.loading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
