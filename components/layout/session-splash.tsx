"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";

/** Se recuerda por pestaña: una vez vista, no se repite entre navegaciones ni recargas de la misma sesión. */
const SPLASH_STORAGE_KEY = "fc-bo-splash-seen";
const BRAND_EASE = [0.16, 1, 0.3, 1] as const;
const WORDMARK = "FitConnect";

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: BRAND_EASE } },
};

/**
 * Animación de entrada a sesión: logo + wordmark en overlay a pantalla completa,
 * mostrada una única vez por pestaña (justo tras entrar al panel). Respeta
 * `prefers-reduced-motion` degradando a un fade corto sin stagger ni spring.
 */
export function SessionSplash() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const t = useTranslations("sessionSplash");

  // useLayoutEffect: decide *antes* del primer paint para no dejar ver el
  // dashboard un frame y luego tapar con el splash (parpadeo inverso).
  useLayoutEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    try {
      //sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
    } catch {
      // sin sessionStorage no persiste; se repetirá en próximas cargas, sin mayor impacto
    }
    const holdMs = reducedMotion ? 500 : 1550;
    const timeout = setTimeout(() => setVisible(false), holdMs);
    return () => clearTimeout(timeout);
  }, [visible, reducedMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="session-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.03 }}
          transition={{ duration: reducedMotion ? 0.2 : 0.45, ease: BRAND_EASE }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background"
        >
          <motion.span
            initial={reducedMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={
              reducedMotion
                ? { duration: 0.2 }
                : { type: "spring", stiffness: 260, damping: 20 }
            }
            className="relative flex w-60 items-center justify-center rounded-2xl"
          >
            {!reducedMotion ? (
              <motion.span
                aria-hidden
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                className="absolute inset-0 rounded-2xl"
              />
            ) : null}
            <Image alt="splash" src={require('@/assets/icon.png')} width={160} height={160}  className="text-primary-foreground" />
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: reducedMotion ? 0 : 0.25, staggerChildren: reducedMotion ? 0 : 0.03 }}
            className="flex text-2xl font-bold tracking-tight text-zinc-900"
            aria-label={WORDMARK}
          >
            {WORDMARK.split("").map((char, index) => (
              <motion.span key={index} variants={letterVariants} aria-hidden>
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reducedMotion ? 0.1 : 0.75, duration: 0.3, ease: BRAND_EASE }}
            className="text-xs uppercase tracking-[0.2em] text-zinc-400"
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
