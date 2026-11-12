"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Map,
  CalendarDays,
  Users,
  RefreshCw,
} from "lucide-react";

const initialStats = {
  places: 0,
  districts: 0,
  events: 0,
  guides: 0,
};

const statItems = [
  {
    title: "Total Places",
    key: "places",
    icon: MapPin,
    href: "/admin/dashboard/places",
  },
  {
    title: "Total Districts",
    key: "districts",
    icon: Map,
    href: "/admin/dashboard/districts",
  },
  {
    title: "Total Events",
    key: "events",
    icon: CalendarDays,
    href: "/admin/dashboard/events",
  },
  {
    title: "Total Guides",
    key: "guides",
    icon: Users,
    href: "/admin/dashboard/guides",
  },
];

export default function DashboardContent() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        setError("");

        const response = await fetch("/api/admin/dashboard/stats", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load dashboard statistics."
          );
        }

        setStats(data.stats);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => controller.abort();
  }, [retry]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Welcome to your Bangladesh Tourism admin dashboard.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>

          <button
            onClick={() => {
              setLoading(true);
              setRetry((current) => current + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : stats[item.key]}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}