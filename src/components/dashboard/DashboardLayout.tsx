import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-[100dvh] bg-background">
      {/* Sidebar ocupa su propio ancho; main usa min-w-0 para evitar “scroll-x” */}
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[min(100%,theme(spacing.9xl))]">{children}</div>
      </main>
    </div>
  );
}
