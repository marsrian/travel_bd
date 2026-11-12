"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "@/components/tourism/PageHeader";
import DistrictCard from "@/components/tourism/DistrictCard";
import { useAppSettings } from "@/components/ThemeLanguageProvider";
import { formatNumber } from "@/lib/tourism";

export default function DistrictsClient() {
  // Global language settings from Navbar
  const { language, settingsLoaded } = useAppSettings();

  const currentLanguage = settingsLoaded ? language : "en";
  const isBn = currentLanguage === "bn";

  // States
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format numbers according to selected language
  const number = (value) => formatNumber(value, currentLanguage);

  // Load districts
  useEffect(() => {
    const controller = new AbortController();

    async function loadDistricts() {
      try {
        const response = await fetch("/api/districts", {
          signal: controller.signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load districts.");
        }

        setDistricts(result.data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDistricts();

    return () => controller.abort();
  }, []);

  // Filter districts based on search
  const filteredDistricts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return districts;

    return districts.filter((district) => {
      const nameEn = district.name?.en || "";
      const nameBn = district.name?.bn || "";
      const divisionEn = district.division?.en || "";
      const divisionBn = district.division?.bn || "";

      return [nameEn, nameBn, divisionEn, divisionBn].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [districts, search]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <PageHeader
        eyebrow={
          isBn ? `বাংলাদেশের ${number(64)} জেলা` : "64 Districts of Bangladesh"
        }
        title={
          isBn
            ? "জেলা ঘুরে বাংলাদেশ আবিষ্কার করুন"
            : "Explore Bangladesh District by District"
        }
        description={
          isBn
            ? "প্রতিটি জেলার ইতিহাস, সংস্কৃতি, প্রাকৃতিক সৌন্দর্য ও দর্শনীয় স্থান সম্পর্কে জানুন।"
            : "Discover the history, culture, natural beauty and tourist attractions of every district."
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Section Heading and District Count */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isBn ? "বাংলাদেশের সকল জেলা" : "All Districts"}
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isBn
              ? `${number(filteredDistricts.length)}টি জেলা`
              : `${filteredDistricts.length} districts`}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative mb-9 max-w-xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isBn ? "জেলার নাম লিখুন..." : "Search district name..."
            }
            className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBn ? "কোনো জেলা পাওয়া যায়নি" : "No districts found"}
            </h3>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {isBn
                ? "অন্য নাম দিয়ে খুঁজুন।"
                : "Try searching with another name."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDistricts.map((district) => (
              <DistrictCard
                key={district._id || district.slug}
                district={district}
                language={currentLanguage}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
