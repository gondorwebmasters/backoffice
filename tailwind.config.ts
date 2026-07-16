import type { Config } from "tailwindcss";

/** Tripleta CSS var → color Tailwind con soporte de opacidad. */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const zincScale = {
  50: v("--z-50"),
  100: v("--z-100"),
  200: v("--z-200"),
  300: v("--z-300"),
  400: v("--z-400"),
  500: v("--z-500"),
  600: v("--z-600"),
  700: v("--z-700"),
  800: v("--z-800"),
  900: v("--z-900"),
  950: v("--z-950"),
};

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Tokens semánticos: las clases zinc/white existentes se vuelven
        // dinámicas (light/dark) vía CSS variables — ver globals.css.
        background: v("--background"),
        white: v("--surface"),
        zinc: zincScale,
        slate: zincScale,
        primary: {
          DEFAULT: v("--primary"),
          foreground: v("--primary-fg"),
          chart: v("--primary-chart"),
        },
        red: {
          50: v("--red-50"),
          200: v("--red-200"),
          300: v("--red-300"),
          400: v("--red-400"),
          500: v("--red-500"),
          600: v("--red-600"),
        },
        amber: {
          50: v("--amber-50"),
          200: v("--amber-200"),
          500: v("--amber-500"),
          600: v("--amber-600"),
          700: v("--amber-700"),
        },
        emerald: {
          500: v("--emerald-500"),
        },
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(2 6 23 / 0.05), 0 4px 12px -2px rgb(2 6 23 / 0.10)",
        "card-hover": "0 2px 4px 0 rgb(2 6 23 / 0.06), 0 12px 28px -6px rgb(2 6 23 / 0.16)",
        pop: "0 4px 8px -2px rgb(2 6 23 / 0.10), 0 20px 40px -8px rgb(2 6 23 / 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
