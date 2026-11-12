
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Save } from "lucide-react";

const initialForm = {
  title: { en: "", bn: "" },
  description: { en: "", bn: "" },
  districtSlug: "",
  location: { en: "", bn: "" },
  startsAt: "",
  endsAt: "",
  coverImage: "",
  status: "draft",
};

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

// Create initial form data for Add/Edit mode
function createEventForm(event) {
  if (!event) {
    return {
      ...initialForm,
      title: { ...initialForm.title },
      description: { ...initialForm.description },
      location: { ...initialForm.location },
    };
  }

  return {
    title: {
      en: event.title?.en || "",
      bn: event.title?.bn || "",
    },
    description: {
      en: event.description?.en || "",
      bn: event.description?.bn || "",
    },
    districtSlug: event.districtSlug || "",
    location: {
      en: event.location?.en || "",
      bn: event.location?.bn || "",
    },
    startsAt: toDateTimeLocal(event.startsAt),
    endsAt: toDateTimeLocal(event.endsAt),
    coverImage: event.coverImage || "",
    status: event.status || "draft",
  };
}

export default function EventForm({
  event,
  districts = [],
  onClose,
  onSubmit,
  saving,
}) {
  const [form, setForm] = useState(() => createEventForm(event));
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateNestedField(parent, field, value) {
    setForm((previous) => ({
      ...previous,
      [parent]: {
        ...previous[parent],
        [field]: value,
      },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Required field validation
    if (!form.title.en.trim()) {
      setError("English event title is required.");
      return;
    }

    if (!form.startsAt || !form.endsAt) {
      setError("Please select event start and end dates.");
      return;
    }

    const startDate = new Date(form.startsAt);
    const endDate = new Date(form.endsAt);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please enter valid event dates.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const payload = {
      ...form,
      title: {
        en: form.title.en.trim(),
        bn: form.title.bn.trim(),
      },
      description: {
        en: form.description.en.trim(),
        bn: form.description.bn.trim(),
      },
      location: {
        en: form.location.en.trim(),
        bn: form.location.bn.trim(),
      },
      districtSlug: form.districtSlug,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      coverImage: form.coverImage.trim(),
    };

    try {
      const result = await onSubmit(payload);

      if (result?.success === false) {
        setError(result.message || "Something went wrong.");
      }
    } catch (submitError) {
      setError(
        submitError.message ||
          "Failed to save event. Please try again."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {event ? "Edit Event" : "Add New Event"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Enter event information in both languages.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5">
          {/* Event Title */}
          <section>
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Event Title
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  English Title *
                </label>

                <input
                  className={inputClass}
                  value={form.title.en}
                  onChange={(e) =>
                    updateNestedField("title", "en", e.target.value)
                  }
                  placeholder="e.g. Sunamganj Haor Festival"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  বাংলা শিরোনাম
                </label>

                <input
                  className={inputClass}
                  value={form.title.bn}
                  onChange={(e) =>
                    updateNestedField("title", "bn", e.target.value)
                  }
                  placeholder="ইভেন্টের নাম"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Description
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  English Description
                </label>

                <textarea
                  className={inputClass}
                  rows={5}
                  value={form.description.en}
                  onChange={(e) =>
                    updateNestedField(
                      "description",
                      "en",
                      e.target.value
                    )
                  }
                  placeholder="Describe the event..."
                />
              </div>

              <div>
                <label className={labelClass}>
                  বাংলা বিবরণ
                </label>

                <textarea
                  className={inputClass}
                  rows={5}
                  value={form.description.bn}
                  onChange={(e) =>
                    updateNestedField(
                      "description",
                      "bn",
                      e.target.value
                    )
                  }
                  placeholder="ইভেন্ট সম্পর্কে লিখুন..."
                />
              </div>
            </div>
          </section>

          {/* District */}
          <section>
            <label className={labelClass}>
              District
            </label>

            <select
              className={inputClass}
              value={form.districtSlug}
              onChange={(e) =>
                updateField("districtSlug", e.target.value)
              }
            >
              <option value="">Select District (Optional)</option>

              {districts.map((district) => (
                <option key={district._id} value={district.slug}>
                  {district.name?.en || district.slug}
                </option>
              ))}
            </select>
          </section>

          {/* Location */}
          <section>
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Event Location
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  English Location
                </label>

                <input
                  className={inputClass}
                  value={form.location.en}
                  onChange={(e) =>
                    updateNestedField("location", "en", e.target.value)
                  }
                  placeholder="Event location"
                />
              </div>

              <div>
                <label className={labelClass}>
                  বাংলা লোকেশন
                </label>

                <input
                  className={inputClass}
                  value={form.location.bn}
                  onChange={(e) =>
                    updateNestedField("location", "bn", e.target.value)
                  }
                  placeholder="ইভেন্টের স্থান"
                />
              </div>
            </div>
          </section>

          {/* Dates */}
          <section>
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Event Schedule
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Start Date & Time *
                </label>

                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.startsAt}
                  onChange={(e) =>
                    updateField("startsAt", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  End Date & Time *
                </label>

                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.endsAt}
                  onChange={(e) =>
                    updateField("endsAt", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* Cover Image */}
          <section>
            <label className={labelClass}>
              Cover Image URL
            </label>

            <input
              className={inputClass}
              type="url"
              value={form.coverImage}
              onChange={(e) =>
                updateField("coverImage", e.target.value)
              }
              placeholder="https://example.com/event-image.jpg"
            />

            {form.coverImage && (
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <Image
                  src={form.coverImage}
                  alt="Event cover preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 700px"
                  className="object-cover"
                />
              </div>
            )}
          </section>

          {/* Status */}
          <section>
            <label className={labelClass}>
              Publication Status
            </label>

            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value)
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </section>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : event
                  ? "Update Event"
                  : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
