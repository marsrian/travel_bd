
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Save, Plus, Trash2 } from "lucide-react";

const emptyPlace = {
  name: { en: "", bn: "" },
  districtSlug: "",
  category: "",
  summary: { en: "", bn: "" },
  history: { en: "", bn: "" },
  visitingInfo: {},
  location: {},
  transportation: { en: "", bn: "" },
  bestVisitingTime: { en: "", bn: "" },
  coverImage: "",
  images: [],
  isFeatured: false,
  status: "draft",
};

function toFormData(place) {
  if (!place) return { ...emptyPlace };

  return {
    ...emptyPlace,
    ...place,
    name: {
      en: place.name?.en || "",
      bn: place.name?.bn || "",
    },
    summary: {
      en: place.summary?.en || "",
      bn: place.summary?.bn || "",
    },
    history: {
      en: place.history?.en || "",
      bn: place.history?.bn || "",
    },
    transportation: place.transportation || { en: "", bn: "" },
    bestVisitingTime: place.bestVisitingTime || { en: "", bn: "" },
    visitingInfo: place.visitingInfo || {},
    location: place.location || {},
    images: Array.isArray(place.images) ? place.images : [],
  };
}

function JsonEditor({ label, value, onChange }) {
  const [text, setText] = useState(() =>
    JSON.stringify(value ?? {}, null, 2)
  );

  const [error, setError] = useState("");

  function handleChange(nextText) {
    setText(nextText);

    try {
      const parsed = JSON.parse(nextText);
      setError("");
      onChange(parsed);
    } catch {
      setError("সঠিক JSON format লিখুন।");
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <textarea
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        rows={6}
        spellCheck={false}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function PlaceForm({
  initialPlace,
  districts,
  categories,
  saving,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() => toFormData(initialPlace));
  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateNested(field, language, value) {
    setForm((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        [language]: value,
      },
    }));
  }

  function addImage() {
    const url = imageInput.trim();

    if (!url) return;

    setForm((previous) => ({
      ...previous,
      images: [...previous.images, url],
    }));

    setImageInput("");
  }

  function removeImage(index) {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.en.trim() || !form.name.bn.trim()) {
      setError("English ও বাংলা Place Name দুটোই দিতে হবে।");
      return;
    }

    if (!form.districtSlug || !form.category) {
      setError("District এবং Category নির্বাচন করুন।");
      return;
    }

    if (!form.summary.en.trim() || !form.summary.bn.trim()) {
      setError("English ও বাংলা Summary দুটোই দিতে হবে।");
      return;
    }

    if (!form.history.en.trim() || !form.history.bn.trim()) {
      setError("English ও বাংলা History দুটোই দিতে হবে।");
      return;
    }

    const selectedDistrict = districts.find(
      (item) => item.slug === form.districtSlug,
    );

    const districtName = selectedDistrict?.name || {
      en: "",
      bn: "",
    };

    const payload = {
      ...form,
      districtName,
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError.message || "কিছু একটা সমস্যা হয়েছে।");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div className="mx-auto my-4 max-w-5xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialPlace ? "Edit Place" : "Add New Place"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Place information in English and Bengali
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-4 sm:p-6">
          {/* Basic Information */}
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Place Name (English) *</label>
                <input
                  className={inputClass}
                  value={form.name.en}
                  onChange={(e) => updateNested("name", "en", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Place Name (বাংলা) *</label>
                <input
                  className={inputClass}
                  value={form.name.bn}
                  onChange={(e) => updateNested("name", "bn", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>District *</label>
                <select
                  className={inputClass}
                  value={form.districtSlug}
                  onChange={(e) => updateField("districtSlug", e.target.value)}
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district.slug}>
                      {district.name?.en || district.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>
                      {category.name?.en || category.slug}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              Summary
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {["en", "bn"].map((language) => (
                <div key={language}>
                  <label className={labelClass}>
                    {language === "en"
                      ? "English Summary *"
                      : "বাংলা Summary *"}
                  </label>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={form.summary[language]}
                    onChange={(e) =>
                      updateNested("summary", language, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              History
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {["en", "bn"].map((language) => (
                <div key={language}>
                  <label className={labelClass}>
                    {language === "en"
                      ? "English History *"
                      : "বাংলা History *"}
                  </label>
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={form.history[language]}
                    onChange={(e) =>
                      updateNested("history", language, e.target.value)
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Additional Information */}
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              Additional Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <JsonEditor
                label="Visiting Information (JSON)"
                value={form.visitingInfo}
                onChange={(value) => updateField("visitingInfo", value)}
              />

              <JsonEditor
                label="Location (JSON)"
                value={form.location}
                onChange={(value) => updateField("location", value)}
              />

              <JsonEditor
                label="Transportation (JSON)"
                value={form.transportation}
                onChange={(value) => updateField("transportation", value)}
              />

              <JsonEditor
                label="Best Visiting Time (JSON)"
                value={form.bestVisitingTime}
                onChange={(value) => updateField("bestVisitingTime", value)}
              />
            </div>
          </section>

          {/* Images */}
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              Images
            </h3>

            <div>
              <label className={labelClass}>Cover Image URL</label>
              <input
                className={inputClass}
                value={form.coverImage}
                onChange={(e) => updateField("coverImage", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="mt-4">
              <label className={labelClass}>Gallery Image URLs</label>

              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Enter image URL"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="shrink-0 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {form.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="flex items-center gap-3 rounded-lg bg-slate-100 p-2 dark:bg-slate-800"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <p className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
                      {image}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      aria-label="Remove image"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Publishing */}
          <section className="grid gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 md:grid-cols-2">
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 self-end pb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={Boolean(form.isFeatured)}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Featured Place
            </label>
          </section>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving
                ? "Saving..."
                : initialPlace
                  ? "Update Place"
                  : "Create Place"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
