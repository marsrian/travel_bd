
"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

const createInitialForm = (category) => ({
  name: {
    en: category?.name?.en || "",
    bn: category?.name?.bn || "",
  },
  slug: category?.slug || "",
  description: {
    en: category?.description?.en || "",
    bn: category?.description?.bn || "",
  },
  icon: category?.icon || "",
  coverImage: category?.coverImage || "",
  status: category?.status || "active",
});

export default function CategoryForm({
  category,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() =>
    createInitialForm(category)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(category);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateNestedField(parent, field, value) {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/admin/categories/${category._id}`
        : "/api/admin/categories";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save category"
        );
      }

      onSuccess();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage category information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* English name */}
          <div>
            <label className={labelClass}>
              Category Name (English) *
            </label>

            <input
              type="text"
              required
              maxLength={150}
              value={form.name.en}
              onChange={(e) =>
                updateNestedField("name", "en", e.target.value)
              }
              placeholder="Example: Beaches"
              className={inputClass}
            />
          </div>

          {/* Bengali name */}
          <div>
            <label className={labelClass}>
              Category Name (Bengali)
            </label>

            <input
              type="text"
              maxLength={150}
              value={form.name.bn}
              onChange={(e) =>
                updateNestedField("name", "bn", e.target.value)
              }
              placeholder="উদাহরণ: সমুদ্রসৈকত"
              className={inputClass}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelClass}>Slug</label>

            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                updateField("slug", e.target.value)
              }
              placeholder="beaches"
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-500">
              Leave empty if your API generates the slug automatically.
            </p>
          </div>

          {/* English description */}
          <div>
            <label className={labelClass}>
              Description (English)
            </label>

            <textarea
              rows={3}
              maxLength={1000}
              value={form.description.en}
              onChange={(e) =>
                updateNestedField(
                  "description",
                  "en",
                  e.target.value
                )
              }
              placeholder="Write category description..."
              className={inputClass}
            />
          </div>

          {/* Bengali description */}
          <div>
            <label className={labelClass}>
              Description (Bengali)
            </label>

            <textarea
              rows={3}
              maxLength={1000}
              value={form.description.bn}
              onChange={(e) =>
                updateNestedField(
                  "description",
                  "bn",
                  e.target.value
                )
              }
              placeholder="ক্যাটাগরির বিবরণ লিখুন..."
              className={inputClass}
            />
          </div>

          {/* Icon */}
          <div>
            <label className={labelClass}>Icon / Emoji</label>

            <input
              type="text"
              value={form.icon}
              onChange={(e) =>
                updateField("icon", e.target.value)
              }
              placeholder="Example: 🏖️"
              className={inputClass}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className={labelClass}>Cover Image URL</label>

            <input
              type="url"
              value={form.coverImage}
              onChange={(e) =>
                updateField("coverImage", e.target.value)
              }
              placeholder="https://example.com/image.jpg"
              className={inputClass}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>

            <select
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value)
              }
              className={inputClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
