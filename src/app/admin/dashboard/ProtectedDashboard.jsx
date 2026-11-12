"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminDashboardShell from "./AdminDashboardShell";

export default function ProtectedDashboard({ children }) {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function verifyAdmin() {
      try {
        const response = await fetch("/api/admin/auth/me", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!data.admin) {
          router.replace("/admin/login");
          return;
        }

        setAdmin(data.admin);
      } catch (error) {
        if (error.name !== "AbortError") {
          router.replace("/admin/login");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    verifyAdmin();

    return () => controller.abort();
  }, [router]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-600/20 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Verifying admin session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardShell admin={admin}>
      {children}
    </AdminDashboardShell>
  );
}