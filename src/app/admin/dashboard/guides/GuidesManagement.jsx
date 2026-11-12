
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  X,
} from "lucide-react";

import GuideForm from "./GuideForm";

const LIMIT = 10;

export default function GuidesManagement() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGuides, setTotalGuides] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch guides when filters, page, or reload key changes.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchGuides() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(LIMIT),
        });

        if (search.trim()) params.set("q", search.trim());
        if (status) params.set("status", status);

        const response = await fetch(
          `/api/admin/guides?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load guides."
          );
        }

        if (controller.signal.aborted) return;

        setGuides(data.guides || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalGuides(data.pagination?.total || 0);
        setError("");
      } catch (err) {
        if (
          !controller.signal.aborted &&
          err.name !== "AbortError"
        ) {
          setError(err.message || "Failed to load guides.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchGuides();

    return () => controller.abort();
  }, [page, search, status, reloadKey]);

  // Refresh guides.
  function handleRefresh() {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  const openCreateForm = () => {
    setSelectedGuide(null);
    setFormOpen(true);
  };

  const openEditForm = async (id) => {
    try {
      setEditLoading(true);
      setError("");

      const response = await fetch(`/api/admin/guides/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load guide."
        );
      }

      setSelectedGuide(data.guide);
      setFormOpen(true);
    } catch (err) {
      setError(err.message || "Could not open this guide.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (guide) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        guide.title?.en || "this guide"
      }"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(guide._id);
      setError("");

      const response = await fetch(
        `/api/admin/guides/${guide._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete guide."
        );
      }

      // Move to the previous page if the last item was deleted.
      if (guides.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        handleRefresh();
      }
    } catch (err) {
      setError(err.message || "Failed to delete guide.");
    } finally {
      setDeletingId("");
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedGuide(null);

    setLoading(true);
    setError("");
    setPage(1);
    setReloadKey((current) => current + 1);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusBadge = (value) => {
    const published = value === "published";

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          published
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        }`}
      >
        {published ? "Published" : "Draft"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Travel Guides
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage your bilingual travel articles.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <Plus size={18} />
          Add New Guide
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg bg-green-100 p-3 text-green-700 dark:bg-green-950 dark:text-green-300">
            <BookOpen size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Total Guides</p>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalGuides}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <BookOpen size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Current Page</p>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {page} / {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title or slug..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setLoading(true);
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Guides table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Guide</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Published Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <LoaderCircle
                      size={25}
                      className="mx-auto animate-spin text-green-700"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Loading guides...
                    </p>
                  </td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <BookOpen
                      size={30}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
                      No guides found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add a new guide or change your search.
                    </p>
                  </td>
                </tr>
              ) : (
                guides.map((guide) => (
                  <tr
                    key={guide._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={
                              guide.coverImage ||
                              "/images/placeholder.jpg"
                            }
                            alt={guide.title?.en || "Guide"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="max-w-xs font-semibold text-slate-900 dark:text-white">
                            {guide.title?.en || "Untitled"}
                          </p>

                          <p className="mt-1 max-w-xs text-xs text-slate-500">
                            {guide.title?.bn || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="block max-w-[180px] truncate">
                        {guide.slug}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {statusBadge(guide.status)}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(guide.publishedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(guide._id)}
                          disabled={
                            editLoading || deletingId === guide._id
                          }
                          title="Edit guide"
                          className="rounded-lg p-2 text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950"
                        >
                          {editLoading ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Pencil size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(guide)}
                          disabled={deletingId === guide._id}
                          title="Delete guide"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          {deletingId === guide._id ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {guides.length} of {totalGuides} guides
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((current) => Math.max(1, current - 1));
              }}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="min-w-20 text-center text-sm text-slate-600 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                );
              }}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Guide form */}
      {formOpen && (
        <GuideForm
          key={selectedGuide?._id || "new-guide"}
          guide={selectedGuide}
          onClose={() => {
            setFormOpen(false);
            setSelectedGuide(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
