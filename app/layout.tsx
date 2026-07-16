import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ApolloWrapper } from "@/lib/apollo/wrapper";
import { THEME_INIT_SCRIPT } from "@/lib/theme/init-script";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitConnect · Backoffice",
  description: "Panel de administración de FitConnect",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={jakarta.variable}>
      <body className="font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <ApolloWrapper>
            <ToastProvider>{children}</ToastProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
