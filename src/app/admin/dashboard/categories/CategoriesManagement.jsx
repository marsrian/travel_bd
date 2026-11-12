"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import CategoryForm from "./CategoryForm";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories when filters, page, or reload key changes.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const params = new URLSearchParams({
          q: search,
          status,
          page: String(page),
          limit: "10",
        });

        const response = await fetch(
          `/api/admin/categories?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load categories"
          );
        }

        if (controller.signal.aborted) return;

        setError("");
        setCategories(data.categories || []);

        setPagination({
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        });
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

    fetchCategories();

    return () => controller.abort();
  }, [search, status, page, reloadKey]);

  // Refresh manually.
  function handleRefresh() {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  // Open add form.
  function openAddForm() {
    setSelectedCategory(null);
    setShowForm(true);
  }

  // Open edit form.
  async function openEditForm(id) {
    try {
      const response = await fetch(`/api/admin/categories/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load category"
        );
      }

      setSelectedCategory(data.category);
      setShowForm(true);
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  }

  // Delete category.
  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name?.en}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${category._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category"
        );
      }

      alert(data.message || "Category deleted successfully");

      if (categories.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        handleRefresh();
      }
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  }

  // After successful create or update.
  function handleFormSuccess() {
    setShowForm(false);
    setSelectedCategory(null);
    handleRefresh();
  }

  // Close form.
  function handleFormClose() {
    setShowForm(false);
    setSelectedCategory(null);
  }

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage tourism place categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            className={`${inputClass} w-full pl-10`}
            placeholder="Search category..."
            value={search}
            onChange={(event) => {
              setLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={inputClass}
          value={status}
          onChange={(event) => {
            setLoading(true);
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Categories table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            All Categories
          </h2>

          <span className="text-sm text-slate-500">
            Total: {pagination.total}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Loading categories...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="mb-3 text-sm text-red-500">{error}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white"
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen
              className="mx-auto mb-3 text-slate-400"
              size={35}
            />

            <p className="font-medium text-slate-700 dark:text-slate-300">
              No categories found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first category to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name?.en}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {category.name?.bn}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {category.slug}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          category.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(category._id)}
                          title="Edit"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          title="Delete"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Page {page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage((current) => current - 1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage((current) => current + 1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category form */}
      {showForm && (
        <CategoryForm
          key={selectedCategory?._id || "new-category"}
          category={selectedCategory}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}