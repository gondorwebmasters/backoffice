"use client";

import { useQuery } from "@apollo/client";
import type { CSSProperties } from "react";

import { GET_ACTIVE_COMPANY_LOGO } from "@/lib/graphql/companies";

import { useSession } from "./session-provider";

type CompanyLogoData = {
  getCompanies: { success: boolean; company: { id: string; logo?: { url: string } | null } | null } | null;
};

// Máscara radial: funde los cuatro bordes de la imagen a transparente en vez
// de dejar el rectángulo recortado a la vista — así se percibe como parte
// del fondo, no como una foto pegada encima.
const LOGO_MASK: CSSProperties = {
  maskImage: "radial-gradient(ellipse 55% 60% at 50% 50%, black 35%, transparent 78%)",
  WebkitMaskImage: "radial-gradient(ellipse 55% 60% at 50% 50%, black 35%, transparent 78%)",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

/**
 * Fondo decorativo del layout: el logo de la empresa activa, a tamaño
 * completo y muy translúcido, pegado al borde derecho, con luces suaves de
 * color detrás. Vive por debajo de sidebar/topbar/tarjetas (todas opacas),
 * así que solo asoma en los huecos del fondo de página — nunca compite con
 * el contenido ni con el contraste de texto.
 */
export function CompanyBackdrop() {
  const { user } = useSession();
  const { data } = useQuery<CompanyLogoData>(GET_ACTIVE_COMPANY_LOGO, {
    variables: { companyId: user?.activeCompanyId },
    skip: !user?.activeCompanyId,
  });

  const logoUrl = data?.getCompanies?.company?.logo?.url;
  if (!logoUrl) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/25 blur-[120px]" />
      <div className="absolute -right-16 top-1/3 h-[26rem] w-[26rem] rounded-full bg-emerald-500/15 blur-[110px]" />
      <div className="absolute -right-28 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/15 blur-[110px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        style={LOGO_MASK}
        className="absolute right-[-6%] top-1/2 h-[85vh] w-auto -translate-y-1/2 object-contain opacity-[0.09] blur-[1px] dark:opacity-[0.07]"
      />
      {/* Refuerza la fusión con el fondo por si el logo tiene su propio recuadro/color sólido */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-transparent via-transparent to-background/80" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent" />
    </div>
  );
}
