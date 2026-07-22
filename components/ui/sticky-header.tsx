import type { ReactNode } from "react";

/**
 * Cabecera de página fija + contenido con scroll propio.
 *
 * OJO: esto NO usa `position: sticky` en el header. Con un offset alto
 * (necesario para no quedar bajo el topbar flotante), sticky reserva en el
 * flujo solo el alto propio del header — el contenido posterior, al hacer
 * scroll, puede "adelantarlo" y pintarse por encima (se ve como texto
 * solapado). El fix real es que el CONTENIDO viva en su propia caja de alto
 * fijo con overflow-y-auto (recortada), nunca visible fuera de sus límites;
 * el header, fuera de esa caja, nunca puede quedar tapado.
 *
 * `h-[calc(100vh-8rem)]` = 100vh − topbar(4rem) − padding vertical de
 * `main` (py-8 = 4rem). El header no encoge (shrink-0); el resto del alto
 * lo consume el contenido, que es quien scrollea.
 */
export function PageShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="shrink-0">{header}</div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-1">{children}</div>
    </div>
  );
}
