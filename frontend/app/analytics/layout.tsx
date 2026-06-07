"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/lib/protected-route";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 ml-64 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pt-16">
            <div className="relative min-h-full p-6">
              {/* Ambient gradient blobs */}
              <div
                aria-hidden="true"
                className="pointer-events-none fixed top-0 left-64 w-[700px] h-[500px] opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[400px]"
                style={{
                  background:
                    "radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.05) 0%, transparent 60%)",
                }}
              />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
