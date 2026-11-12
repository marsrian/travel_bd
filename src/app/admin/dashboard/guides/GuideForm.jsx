
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Save, LoaderCircle } from "lucide-react";

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

const initialForm = (guide) => ({
  titleEn: guide?.title?.en || "",
  titleBn: guide?.title?.bn || "",
  slug: guide?.slug || "",
  descriptionEn: guide?.description?.en || "",
  descriptionBn: guide?.description?.bn || "",
  contentEn: guide?.content?.en || "",
  contentBn: guide?.content?.bn || "",
  coverImage: guide?.coverImage || "",
  status: guide?.status || "draft",
  publishedAt: toDateTimeLocal(guide?.publishedAt),
});

export default function GuideForm({
  guide = null,
  onClose,
  onSuccess,
}) {
  const isEditing = Boolean(guide?._id);

  const [form, setForm] = useState(() => initialForm(guide));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "coverImage") {
      setImageError(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.titleEn.trim() ||
      !form.titleBn.trim() ||
      !form.contentEn.trim() ||
      !form.contentBn.trim()
    ) {
      setError(
        "Both titles and both article contents are required."
      );
      return;
    }

    const payload = {
      title: {
        en: form.titleEn.trim(),
        bn: form.titleBn.trim(),
      },
      slug: form.slug.trim(),
      description: {
        en: form.descriptionEn.trim(),
        bn: form.descriptionBn.trim(),
      },
      content: {
        en: form.contentEn,
        bn: form.contentBn,
      },
      coverImage: form.coverImage.trim(),
      status: form.status,
      publishedAt:
        form.status === "published" && form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
    };

    try {
      setSaving(true);

      const url = isEditing
        ? `/api/admin/guides/${guide._id}`
        : "/api/admin/guides";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to save guide.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-green-900";

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Edit Travel Guide" : "Add New Travel Guide"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill in the English and Bengali guide information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-5"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Title (English) *</label>
                <input
                  name="titleEn"
                  value={form.titleEn}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Example: Best Places to Visit in Sylhet"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Title (বাংলা) *</label>
                <input
                  name="titleBn"
                  value={form.titleBn}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="ভ্রমণ গাইডের শিরোনাম"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={inputClass}
                placeholder="Leave empty to use the English title"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use English letters, numbers and hyphens.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Short Description (English)
                </label>
                <textarea
                  name="descriptionEn"
                  value={form.descriptionEn}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="A short summary of this guide..."
                />
              </div>

              <div>
                <label className={labelClass}>
                  Short Description (বাংলা)
                </label>
                <textarea
                  name="descriptionBn"
                  value={form.descriptionBn}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="গাইডটির সংক্ষিপ্ত বিবরণ..."
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Cover Image URL</label>
              <input
                name="coverImage"
                type="url"
                value={form.coverImage}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://example.com/image.jpg"
              />

              {form.coverImage && !imageError && (
                <div className="relative mt-3 h-36 w-full overflow-hidden rounded-lg sm:w-64">
                  <Image
                    src={form.coverImage}
                    alt="Cover preview"
                    fill
                    sizes="(max-width: 640px) 100vw, 256px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              {imageError && (
                <p className="mt-2 text-xs text-red-500">
                  Unable to load image. Please check the image URL.
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-800" />

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Full Article Content
            </h3>

            <div>
              <label className={labelClass}>
                Article Content (English) *
              </label>
              <textarea
                name="contentEn"
                value={form.contentEn}
                onChange={handleChange}
                rows={12}
                className={inputClass}
                placeholder="Write the full English article here..."
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Article Content (বাংলা) *
              </label>
              <textarea
                name="contentBn"
                value={form.contentBn}
                onChange={handleChange}
                rows={12}
                className={inputClass}
                placeholder="এখানে সম্পূর্ণ বাংলা আর্টিকেল লিখুন..."
                required
              />
            </div>

            <p className="text-xs text-slate-500">
              এই editor plain text সংরক্ষণ করে। আপনার বর্তমান API অনুযায়ী
              article content string হিসেবেই database-এ যাবে।
            </p>
          </section>

          <div className="border-t border-slate-200 dark:border-slate-800" />

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Publication Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {form.status === "published" && (
              <div>
                <label className={labelClass}>Published Date</label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={form.publishedAt}
                  onChange={handleChange}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Leave empty to use the current date when creating a guide.
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Guide"
                  : "Create Guide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
