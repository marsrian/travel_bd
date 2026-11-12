"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

const emptyDistrict = {
  name: { en: "", bn: "" },
  division: "",
  summary: { en: "", bn: "" },
  history: { en: "", bn: "" },
  famousFor: { en: "", bn: "" },
  transportation: { en: "", bn: "" },
  location: {},
  coverImage: "",
  isFeatured: false,
  status: "draft",
};

function normalizeDistrict(district) {
  if (!district) return { ...emptyDistrict };

  return {
    ...emptyDistrict,
    ...district,
    name: {
      en: district.name?.en || "",
      bn: district.name?.bn || "",
    },
    summary: {
      en: district.summary?.en || "",
      bn: district.summary?.bn || "",
    },
    history: {
      en: district.history?.en || "",
      bn: district.history?.bn || "",
    },
    famousFor: {
      en: district.famousFor?.en || "",
      bn: district.famousFor?.bn || "",
    },
    transportation: {
      en: district.transportation?.en || "",
      bn: district.transportation?.bn || "",
    },
    location: district.location || {},
  };
}


function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(() =>
    JSON.stringify(value ?? {}, null, 2)
  );

  const [error, setError] = useState("");

  function handleChange(nextValue) {
    setText(nextValue);

    try {
      const parsed = JSON.parse(nextValue);
      setError("");
      onChange(parsed);
    } catch {
      setError("সঠিক JSON format লিখুন।");
    }
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={5}
        spellCheck={false}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}


const divisions = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
];

export default function DistrictForm({
  initialDistrict,
  saving,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() =>
    normalizeDistrict(initialDistrict)
  );
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.en.trim() || !form.name.bn.trim()) {
      setError("English এবং বাংলা District Name দিতে হবে।");
      return;
    }

    if (!form.division) {
      setError("Division নির্বাচন করুন।");
      return;
    }

    if (!form.summary.en.trim() || !form.summary.bn.trim()) {
      setError("English ও বাংলা Summary দিতে হবে।");
      return;
    }

    if (!form.history.en.trim() || !form.history.bn.trim()) {
      setError("English ও বাংলা History দিতে হবে।");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Failed to save district");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const bilingualFields = [
    { key: "summary", label: "Summary", rows: 4 },
    { key: "history", label: "History", rows: 5 },
    { key: "famousFor", label: "Famous For", rows: 3 },
    { key: "transportation", label: "Transportation", rows: 4 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div className="mx-auto my-4 max-w-4xl rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialDistrict ? "Edit District" : "Add New District"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage bilingual district information
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
          <section>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>District Name (English) *</label>
                <input
                  className={inputClass}
                  value={form.name.en}
                  onChange={(e) =>
                    updateNested("name", "en", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>District Name (বাংলা) *</label>
                <input
                  className={inputClass}
                  value={form.name.bn}
                  onChange={(e) =>
                    updateNested("name", "bn", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Division *</label>
                <select
                  className={inputClass}
                  value={form.division}
                  onChange={(e) => updateField("division", e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input
                  className={inputClass}
                  value={form.coverImage}
                  onChange={(e) =>
                    updateField("coverImage", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </section>

          {bilingualFields.map((field) => (
            <section key={field.key}>
              <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
                {field.label}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {["en", "bn"].map((language) => (
                  <div key={language}>
                    <label className={labelClass}>
                      {language === "en"
                        ? `English ${field.label}${["summary", "history"].includes(field.key) ? " *" : ""}`
                        : `বাংলা ${field.label}${["summary", "history"].includes(field.key) ? " *" : ""}`}
                    </label>

                    <textarea
                      rows={field.rows}
                      className={inputClass}
                      value={form[field.key][language]}
                      onChange={(e) =>
                        updateNested(field.key, language, e.target.value)
                      }
                      required={["summary", "history"].includes(field.key)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
              Location (JSON)
            </h3>

            <JsonEditor
              value={form.location}
              onChange={(value) => updateField("location", value)}
            />
          </section>

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
                onChange={(e) =>
                  updateField("isFeatured", e.target.checked)
                }
                className="h-4 w-4 accent-emerald-600"
              />
              Featured District
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
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:text-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={17} />
              {saving
                ? "Saving..."
                : initialDistrict
                  ? "Update District"
                  : "Create District"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}