import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Login | Bangladesh Tourism",
  description: "Login to the Bangladesh Tourism admin dashboard.",
};

// This component accesses request-time cookies.
async function AdminLoginContent() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}

// Loading fallback
function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600/20 border-t-emerald-600" />

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Loading admin login...
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AdminLoginContent />
    </Suspense>
  );
}