"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  cloneElement,
  isValidElement,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  /** Debe ser un único elemento DOM nativo (acepta ref + handlers de evento). */
  children: ReactElement;
  /** Retraso antes de mostrar, en ms (evita parpadeo al pasar rápido). */
  delay?: number;
}

/**
 * Tooltip flotante montado en un portal (document.body): evita el recorte
 * por overflow-hidden/overflow-x-auto de contenedores con scroll (grids,
 * tablas) donde un tooltip posicionado in-place quedaría cortado.
 *
 * Clona el hijo para adjuntar la ref directamente sobre el elemento real
 * (en vez de envolverlo en un <span>): un wrapper con `display:contents` no
 * genera caja propia y devuelve un rect (0,0), y uno normal colapsa a 0 si
 * el hijo está fuera de flujo (p. ej. un botón `position:absolute`).
 */
export function Tooltip({ content, children, delay = 250 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, placement: "top" as "top" | "bottom" });
  const anchorRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const placement = rect.top > 90 ? "top" : "bottom";
      setCoords({
        x: rect.left + rect.width / 2,
        y: placement === "top" ? rect.top - 8 : rect.bottom + 8,
        placement,
      });
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  if (!isValidElement(children)) return children;

  const anchor = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: anchorRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <>
      {anchor}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  role="tooltip"
                  initial={{ opacity: 0, scale: 0.92, y: coords.placement === "top" ? 4 : -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "fixed",
                    left: coords.x,
                    top: coords.y,
                    transform: `translate(-50%, ${coords.placement === "top" ? "-100%" : "0"})`,
                  }}
                  className="pointer-events-none z-[100] max-w-64 rounded-xl border border-t-2 border-zinc-200/80 border-t-primary bg-white px-3 py-2 text-xs leading-relaxed text-zinc-700 shadow-pop dark:border-zinc-700/80 dark:border-t-primary"
                >
                  {content}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}