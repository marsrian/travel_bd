
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import DistrictForm from "./DistrictForm";

const LIMIT = 10;

export default function DistrictsManagement() {
  const [districts, setDistricts] = useState([]);
  const [query, setQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch districts
  useEffect(() => {
    const controller = new AbortController();

    async function fetchDistricts() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(LIMIT),
        });

        if (query.trim()) {
          params.set("q", query.trim());
        }

        if (divisionFilter) {
          params.set("division", divisionFilter);
        }

        const response = await fetch(
          `/api/admin/districts?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load districts"
          );
        }

        if (controller.signal.aborted) return;

        setDistricts(data.districts || []);

        setPagination(
          data.pagination || {
            page: 1,
            total: (data.districts || []).length,
            totalPages: 1,
          }
        );

        setError("");
      } catch (err) {
        if (
          !controller.signal.aborted &&
          err.name !== "AbortError"
        ) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDistricts();

    return () => controller.abort();
  }, [page, query, divisionFilter, reloadKey]);

  function refresh() {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  function openCreateForm() {
    setEditingDistrict(null);
    setShowForm(true);
  }

  function openEditForm(district) {
    setEditingDistrict(district);
    setShowForm(true);
  }

  async function handleSave(payload) {
    setSaving(true);

    try {
      const isEditing = Boolean(editingDistrict);

      const url = isEditing
        ? `/api/admin/districts/${editingDistrict._id}`
        : "/api/admin/districts";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save district"
        );
      }

      setShowForm(false);
      setEditingDistrict(null);
      setNotice(
        data.message || "District saved successfully"
      );

      setLoading(true);
      setError("");
      setPage(1);
      setReloadKey((current) => current + 1);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(district) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        district.name?.en || "this district"
      }"?`
    );

    if (!confirmed) return;

    setDeletingId(district._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/districts/${district._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete district"
        );
      }

      setNotice(
        data.message || "District deleted successfully"
      );

      if (districts.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (err) {
      setError(err.message || "Failed to delete district");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Districts Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all 64 districts of Bangladesh.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add New District
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Districts
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {pagination.total || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Current Page
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {page} / {pagination.totalPages || 1}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {notice}

          <button
            type="button"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => {
              setError("");
              refresh();
            }}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        <div className="relative md:col-span-3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className={`${inputClass} w-full pl-10`}
            placeholder="Search district..."
            value={query}
            onChange={(event) => {
              setLoading(true);
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={inputClass}
          value={divisionFilter}
          onChange={(event) => {
            setLoading(true);
            setDivisionFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Divisions</option>

          {[
            "Barishal",
            "Chattogram",
            "Dhaka",
            "Khulna",
            "Mymensingh",
            "Rajshahi",
            "Rangpur",
            "Sylhet",
          ].map((division) => (
            <option key={division} value={division}>
              {division}
            </option>
          ))}
        </select>

        <div className="md:col-span-4">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 disabled:opacity-50 dark:text-emerald-400"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">District</th>
                <th className="px-5 py-4">Division</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading districts...
                  </td>
                </tr>
              ) : districts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No districts found.
                  </td>
                </tr>
              ) : (
                districts.map((district) => (
                  <tr
                    key={district._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={
                              district.coverImage ||
                              "/images/placeholder.jpg"
                            }
                            alt={district.name?.en || "District"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {district.name?.en || "Untitled"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {district.name?.bn || ""}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={12} />
                            {district.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {district.division || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          district.status === "published"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {district.status || "draft"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {district.isFeatured ? (
                        <Star
                          size={18}
                          className="fill-amber-400 text-amber-400"
                        />
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(district)}
                          title="Edit district"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(district)}
                          disabled={deletingId === district._id}
                          title="Delete district"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {districts.length} of{" "}
            {pagination.total || 0} districts
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) =>
                  Math.max(1, current - 1)
                );
              }}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-2 text-sm text-slate-600 dark:text-slate-300">
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              type="button"
              disabled={
                page >= (pagination.totalPages || 1) ||
                loading
              }
              onClick={() => {
                setLoading(true);
                setPage((current) => current + 1);
              }}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <DistrictForm
          initialDistrict={editingDistrict}
          saving={saving}
          onCancel={() => {
            setShowForm(false);
            setEditingDistrict(null);
          }}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
