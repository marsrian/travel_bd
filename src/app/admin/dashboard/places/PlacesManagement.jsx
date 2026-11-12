
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

import PlaceForm from "./PlaceForm";

const LIMIT = 10;

export default function PlacesManagement() {
  const [places, setPlaces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  // Load places, districts and categories
  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    });

    if (query.trim()) params.set("q", query.trim());
    if (districtFilter) params.set("district", districtFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    async function fetchPlaces() {
      try {
        const [
          placesResponse,
          districtsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(`/api/admin/places?${params.toString()}`, {
            cache: "no-store",
            signal: controller.signal,
          }),

          fetch("/api/admin/districts?limit=100", {
            cache: "no-store",
            signal: controller.signal,
          }),

          fetch("/api/admin/categories?limit=100", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        const [
          placesData,
          districtsData,
          categoriesData,
        ] = await Promise.all([
          placesResponse.json(),
          districtsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!placesResponse.ok) {
          throw new Error(
            placesData.message || "Failed to load places"
          );
        }

        if (!districtsResponse.ok) {
          throw new Error(
            districtsData.message || "Failed to load districts"
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.message || "Failed to load categories"
          );
        }

        if (controller.signal.aborted) return;

        setPlaces(placesData.places || []);

        setPagination(
          placesData.pagination || {
            page: 1,
            total: (placesData.places || []).length,
            totalPages: 1,
          }
        );

        setDistricts(districtsData.districts || []);
        setCategories(categoriesData.categories || []);
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

    fetchPlaces();

    return () => controller.abort();
  }, [
    page,
    query,
    districtFilter,
    categoryFilter,
    reloadKey,
  ]);

  // Refresh
  function refresh() {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  // Open create form
  function openCreateForm() {
    setEditingPlace(null);
    setShowForm(true);
  }

  // Open edit form
  function openEditForm(place) {
    setEditingPlace(place);
    setShowForm(true);
  }

  // Save place
  async function handleSave(payload) {
    setSaving(true);

    try {
      const isEditing = Boolean(editingPlace);

      const url = isEditing
        ? `/api/admin/places/${editingPlace._id}`
        : "/api/admin/places";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save place");
      }

      setShowForm(false);
      setEditingPlace(null);
      setNotice(data.message || "Place saved successfully");

      setLoading(true);
      setPage(1);
      setReloadKey((current) => current + 1);
    } finally {
      setSaving(false);
    }
  }

  // Delete place
  async function handleDelete(place) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${place.name?.en || "this place"}"?`
    );

    if (!confirmed) return;

    setDeletingId(place._id);
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/places/${place._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete place");
      }

      setNotice(data.message || "Place deleted successfully");

      if (places.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        refresh();
      }
    } catch (err) {
      setError(err.message || "Failed to delete place");
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
            Places Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all tourist destinations in Bangladesh.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add New Place
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Places
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
            {pagination.page || page} / {pagination.totalPages || 1}
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
        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className={`${inputClass} w-full pl-10`}
            placeholder="Search places..."
            value={query}
            onChange={(e) => {
              setLoading(true);
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={inputClass}
          value={districtFilter}
          onChange={(e) => {
            setLoading(true);
            setDistrictFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Districts</option>

          {districts.map((district) => (
            <option key={district._id} value={district.slug}>
              {district.name?.en || district.slug}
            </option>
          ))}
        </select>

        <select
          className={inputClass}
          value={categoryFilter}
          onChange={(e) => {
            setLoading(true);
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name?.en || category.slug}
            </option>
          ))}
        </select>

        <div className="md:col-span-4">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          >
            <RefreshCw size={15} />
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
                <th className="px-5 py-4">Place</th>
                <th className="px-5 py-4">District</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading places...
                  </td>
                </tr>
              ) : places.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No places found.
                  </td>
                </tr>
              ) : (
                places.map((place) => (
                  <tr
                    key={place._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={
                              place.coverImage ||
                              "/images/placeholder.jpg"
                            }
                            alt={place.name?.en || "Place"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {place.name?.en || "Untitled"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {place.name?.bn || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {place.districtName?.en || place.districtSlug || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {place.category || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          place.status === "published"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {place.status || "draft"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {place.isFeatured ? (
                        <Star
                          size={18}
                          className="fill-amber-400 text-amber-400"
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(place)}
                          title="Edit place"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(place)}
                          disabled={deletingId === place._id}
                          title="Delete place"
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
            Showing {places.length} of {pagination.total || 0} places
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.max(1, current - 1));
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
              disabled={page >= (pagination.totalPages || 1) || loading}
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

      {/* Place Form */}
      {showForm && (
        <PlaceForm
          initialPlace={editingPlace}
          districts={districts}
          categories={categories}
          saving={saving}
          onCancel={() => {
            setShowForm(false);
            setEditingPlace(null);
          }}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
