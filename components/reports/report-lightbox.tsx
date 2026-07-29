"use client";

import { PDFViewer, type DocumentProps } from "@react-pdf/renderer";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, type ReactElement } from "react";

interface ReportLightboxProps {
  open: boolean;
  onClose: () => void;
  document: ReactElement<DocumentProps>;
}

export function ReportLightbox({ open, onClose, document }: ReportLightboxProps) {
  const t = useTranslations("reports.lightbox");
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-10">
          <motion.div
            className="absolute inset-0 bg-zinc-950/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-pop"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <h2 className="text-sm font-medium text-zinc-900">{t("fullPreview")}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label={t("closePreview")}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 bg-zinc-100">
              <PDFViewer width="100%" height="100%" showToolbar style={{ border: "none" }}>
                {document}
              </PDFViewer>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
