"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import PageHeader from "@/components/tourism/PageHeader";
import PlaceCard from "@/components/tourism/PlaceCard";
import { useAppSettings } from "@/components/ThemeLanguageProvider";
import { formatNumber } from "@/lib/tourism";

export default function PlacesClient() {
  const { language, settingsLoaded } = useAppSettings();

  const currentLanguage = settingsLoaded ? language : "en";
  const isBn = currentLanguage === "bn";

  // Filter states
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  // Data states
  const [places, setPlaces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format numbers according to selected language
  const number = (value) => formatNumber(value, currentLanguage);

  // Start loading from user interactions
  function startLoading() {
    setLoading(true);
    setError("");
  }

  // Load districts
  useEffect(() => {
    const controller = new AbortController();

    async function fetchDistricts() {
      try {
        const response = await fetch("/api/districts", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load districts.");
        }

        const result = await response.json();

        if (controller.signal.aborted) return;

        if (result.success) {
          setDistricts(result.data || []);
        }
      } catch (err) {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          console.error("District loading error:", err);
        }
      }
    }

    fetchDistricts();

    return () => controller.abort();
  }, []);

  // Load places
  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      page: String(page),
      limit: "12",
    });

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (district) {
      params.set("district", district);
    }

    if (category) {
      params.set("category", category);
    }

    async function fetchPlaces() {
      try {
        const response = await fetch(`/api/places?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load places.");
        }

        if (controller.signal.aborted) return;

        setPlaces(result.data || []);

        setPagination({
          page: result.pagination?.page || page,
          totalPages: result.pagination?.totalPages || 1,
          total: result.pagination?.total || 0,
        });

        setError("");
      } catch (err) {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
          setPlaces([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPlaces();

    return () => controller.abort();
  }, [page, search, district, category, retryCount]);

  // Reset filters
  function resetFilters() {
    startLoading();

    setSearch("");
    setDistrict("");
    setCategory("");
    setPage(1);
  }

  // Search submit
  function handleSearch(event) {
    event.preventDefault();
    startLoading();
    setPage(1);
  }

  // Retry after error
  function handleRetry() {
    startLoading();
    setRetryCount((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <PageHeader
        eyebrow={isBn ? "বাংলাদেশ আবিষ্কার করুন" : "Discover Bangladesh"}
        title={isBn ? "বাংলাদেশের দর্শনীয় স্থান" : "Explore Tourist Places"}
        description={
          isBn
            ? "বাংলাদেশের প্রাকৃতিক সৌন্দর্য, ঐতিহাসিক স্থান, সমুদ্রসৈকত ও জনপ্রিয় পর্যটন গন্তব্য ঘুরে দেখুন।"
            : "Discover beautiful landscapes, historical landmarks, beaches and unforgettable destinations throughout Bangladesh."
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-9 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? "আপনার পছন্দের জায়গা খুঁজুন" : "Find Your Destination"}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isBn
                ? "জেলা, নাম অথবা ক্যাটাগরি দিয়ে খুঁজুন"
                : "Search by name, district or category"}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  startLoading();
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  isBn ? "দর্শনীয় স্থান খুঁজুন..." : "Search destinations..."
                }
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* District Filter */}
            <select
              value={district}
              onChange={(e) => {
                startLoading();
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">{isBn ? "সকল জেলা" : "All districts"}</option>

              {districts.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {isBn
                    ? item.name?.bn || item.name?.en
                    : item.name?.en || item.name?.bn}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => {
                startLoading();
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">
                {isBn ? "সকল ক্যাটাগরি" : "All categories"}
              </option>

              <option value="beach">{isBn ? "সমুদ্রসৈকত" : "Beaches"}</option>

              <option value="forest">
                {isBn ? "বন ও প্রকৃতি" : "Forests & Nature"}
              </option>

              <option value="historical">
                {isBn ? "ঐতিহাসিক স্থান" : "Historical"}
              </option>

              <option value="waterfall">{isBn ? "ঝরনা" : "Waterfalls"}</option>
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <SlidersHorizontal size={17} />
              {isBn ? "খুঁজুন" : "Search"}
            </button>
          </form>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {isBn ? "ফিল্টার মুছুন" : "Clear filters"}
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isBn
              ? `মোট ${number(pagination.total)}টি স্থান`
              : `${pagination.total} destinations found`}
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-8 text-center text-red-700 dark:bg-red-950 dark:text-red-300">
            <p>{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 font-semibold underline"
            >
              {isBn ? "আবার চেষ্টা করুন" : "Try again"}
            </button>
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-2xl bg-white py-20 text-center dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? "কোনো স্থান পাওয়া যায়নি" : "No destinations found"}
            </h3>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {isBn
                ? "অন্যভাবে খোঁজার চেষ্টা করুন।"
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <PlaceCard
                key={place._id || place.slug}
                place={place}
                language={currentLanguage}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                startLoading();
                setPage((current) => current - 1);
              }}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-white"
            >
              {isBn ? "আগের" : "Previous"}
            </button>

            <span className="px-4 text-sm text-gray-600 dark:text-gray-300">
              {number(page)} / {number(pagination.totalPages)}
            </span>

            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => {
                startLoading();
                setPage((current) => current + 1);
              }}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-white"
            >
              {isBn ? "পরের" : "Next"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
