"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const SIDEBAR_STORAGE_KEY = "fc-bo-sidebar";

interface ShellContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  openPalette: () => void;
}

const ShellContext = createContext<ShellContextValue>({
  collapsed: false,
  toggleCollapsed: () => {},
  openPalette: () => {},
});

export function useShell() {
  return useContext(ShellContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  // Arranca expandido para no romper la hidratación; el valor guardado
  // se aplica tras montar.
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      // sin localStorage seguimos con el valor por defecto
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "0" : "1");
      } catch {
        // ignorable
      }
      return !value;
    });
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  // Atajo global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ShellContext.Provider value={{ collapsed, toggleCollapsed, openPalette }}>
      <Sidebar />
      <div className={cn("transition-[padding] duration-200", collapsed ? "pl-24" : "pl-72")}>
        <Topbar />
        <main className="mx-auto max-w-7xl px-10 py-8">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </ShellContext.Provider>
  );
}
