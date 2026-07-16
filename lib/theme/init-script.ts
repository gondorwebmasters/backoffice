import { ACCENT_PRESETS, THEME_STORAGE_KEY } from "./palette";

const ACCENT_MAP = Object.fromEntries(
  ACCENT_PRESETS.map((accent) => [accent.id, [accent.rgb, accent.fgRgb, accent.chartDarkRgb]]),
);

/**
 * Script inline anti-FOUC: aplica la clase .dark y el acento guardados en
 * localStorage antes del primer paint. Se inyecta como primer hijo de
 * <body> en el layout raíz (Server Component).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})||"{}");var m=s.mode==="light"||s.mode==="dark"?s.mode:"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var p=${JSON.stringify(
  ACCENT_MAP,
)};var a=p[s.accent];if(a){r.style.setProperty("--primary",a[0]);r.style.setProperty("--primary-fg",a[1]);r.style.setProperty("--primary-chart",d?a[2]:a[0]);}}catch(e){}})();`;
