
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import EventForm from "./EventForm";

const LIMIT = 10;

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });

      if (search.trim()) params.set("q", search.trim());
      if (status) params.set("status", status);

      const response = await fetch(
        `/api/admin/events?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load events.");
      }

      setEvents(data.events || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalEvents(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  // Fetch districts
  const fetchDistricts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/districts?limit=100", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load districts.");
      }

      setDistricts(data.districts || []);
    } catch (err) {
      console.error("District fetch error:", err);
    }
  }, []);

  // Load events when page, search, or status changes.
  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        fetchEvents();
      }
    });

    return () => {
      active = false;
    };
  }, [fetchEvents]);

  // Load districts once
  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        fetchDistricts();
      }
    });

    return () => {
      active = false;
    };
  }, [fetchDistricts]);

  // Create or update event
  async function handleSave(payload) {
    setSaving(true);

    try {
      const isEditing = Boolean(selectedEvent);

      const url = isEditing
        ? `/api/admin/events/${selectedEvent._id}`
        : "/api/admin/events";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to save event.",
        };
      }

      setShowForm(false);
      setSelectedEvent(null);

      await fetchEvents();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Something went wrong.",
      };
    } finally {
      setSaving(false);
    }
  }

  // Delete event
  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      const response = await fetch(
        `/api/admin/events/${deleteTarget._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete event.");
      }

      setDeleteTarget(null);

      if (events.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchEvents();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setDeleteTarget(null);
    }
  }

  function openCreateForm() {
    setSelectedEvent(null);
    setShowForm(true);
  }

  function openEditForm(event) {
    setSelectedEvent(event);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setSelectedEvent(null);
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDistrictName(slug) {
    const district = districts.find((item) => item.slug === slug);
    return district?.name?.en || slug || "—";
  }

  const buttonClass =
    "rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Events Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage tourism events across Bangladesh.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add New Event
        </button>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40">
            <CalendarDays size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Events
            </p>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalEvents}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          onClick={fetchEvents}
          disabled={loading}
          className={buttonClass}
          title="Refresh"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">District</th>
                <th className="px-5 py-4">Start Date</th>
                <th className="px-5 py-4">End Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={
                              event.coverImage ||
                              "/images/placeholder.jpg"
                            }
                            alt={event.title?.en || "Event"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {event.title?.en || "Untitled Event"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {event.title?.bn || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {getDistrictName(event.districtSlug)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(event.startsAt)}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(event.endsAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          event.status === "published"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {event.status || "draft"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(event)}
                          className={buttonClass}
                          title="Edit Event"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
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
        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className={buttonClass + " disabled:opacity-40"}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className={buttonClass + " disabled:opacity-40"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          key={selectedEvent?._id || "new-event"}
          event={selectedEvent}
          districts={districts}
          onClose={closeForm}
          onSubmit={handleSave}
          saving={saving}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
              <Trash2 size={22} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Delete Event?
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800 dark:text-white">
                {deleteTarget.title?.en || "this event"}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
