"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useTransform } from "framer-motion";

/** Cuenta ascendente/descendente animada para valores numéricos de KPIs. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString("es-ES"));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => rounded.on("change", (latest) => {
    if (spanRef.current) spanRef.current.textContent = latest;
  }), [rounded]);

  return <span ref={spanRef} className={className}>0</span>;
}
