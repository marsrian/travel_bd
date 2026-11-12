"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Compass, Bus, Landmark } from "lucide-react";

import PlaceCard from "@/components/tourism/PlaceCard";
import MapSection from "@/components/tourism/MapSection";
import { useAppSettings } from "@/components/ThemeLanguageProvider";

import { getText, getImageUrl } from "@/lib/tourism";

export default function DistrictDetailsClient({ slug }) {
  const { language, setLanguage } = useAppSettings();
  const isBn = language === "bn";

  const [district, setDistrict] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [error, setError] = useState("");

  // Current slug data is still loading until it has been processed
  const loading = loadedSlug !== slug;

  useEffect(() => {
    const controller = new AbortController();

    async function loadDistrict() {
      try {
        const response = await fetch(
          `/api/districts/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "District not found.");
        }

        if (controller.signal.aborted) return;

        setDistrict(result.data);
        setError("");

        const placesResponse = await fetch(
          `/api/places?district=${encodeURIComponent(slug)}&limit=100`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const placesResult = await placesResponse.json();

        if (controller.signal.aborted) return;

        if (placesResponse.ok && placesResult.success) {
          setPlaces(placesResult.data || []);
        } else {
          setPlaces([]);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load district.");
          setDistrict(null);
          setPlaces([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadedSlug(slug);
        }
      }
    }

    loadDistrict();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="mt-8 h-40 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </main>
    );
  }

  if (error || !district) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isBn ? "জেলা পাওয়া যায়নি" : "District not found"}
          </h1>

          <p className="mt-3 text-gray-500">{error}</p>

          <Link
            href="/districts"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            {isBn ? "সকল জেলা দেখুন" : "Explore all districts"}
          </Link>
        </div>
      </main>
    );
  }

  const name = getText(district.name, language);
  const division = getText(district.division, language);
  const summary = getText(district.summary, language);
  const history = getText(district.history, language);
  const transportation = getText(district.transportation, language);
  const famousFor = getText(district.famousFor, language);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* District Hero */}
      <section className="relative flex min-h-100 items-end overflow-hidden bg-gray-900 sm:min-h-125">
        <Image
          src={getImageUrl(district.coverImage)}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
          <Link
            href="/districts"
            className="mb-7 inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <ArrowLeft size={17} />
            {isBn ? "সকল জেলা" : "All districts"}
          </Link>

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-200">
            {division}
          </p>

          <h1 className="text-4xl font-bold text-white sm:text-6xl">{name}</h1>

          <p className="mt-4 flex items-center gap-2 text-white/80">
            <MapPin size={17} />
            {isBn ? "বাংলাদেশ" : "Bangladesh"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* Overview */}
            <section>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {isBn ? "জেলা পরিচিতি" : "District Overview"}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                {isBn ? `${name} জেলা` : `${name} District`}
              </h2>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">
                {summary ||
                  (isBn
                    ? "তথ্য যোগ করা হয়নি।"
                    : "No description available yet.")}
              </p>
            </section>

            {/* History */}
            {history && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  {isBn ? "ইতিহাস ও ঐতিহ্য" : "History & Heritage"}
                </h2>

                <p className="whitespace-pre-line leading-8 text-gray-600 dark:text-gray-300">
                  {history}
                </p>
              </section>
            )}

            {/* Famous for */}
            {famousFor && (
              <section className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/40">
                <div className="flex gap-3">
                  <Landmark className="mt-1 shrink-0 text-emerald-700 dark:text-emerald-400" />

                  <div>
                    <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                      {isBn ? "যে কারণে বিখ্যাত" : "Famous For"}
                    </h2>

                    <p className="mt-3 leading-7 text-emerald-900 dark:text-emerald-100">
                      {famousFor}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Transportation */}
            {transportation && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <Bus className="text-emerald-700 dark:text-emerald-400" />
                  {isBn ? "যাতায়াত ব্যবস্থা" : "Transportation"}
                </h2>

                <p className="whitespace-pre-line leading-8 text-gray-600 dark:text-gray-300">
                  {transportation}
                </p>
              </section>
            )}

            {/* Tourist places */}
            <section>
              <div className="mb-7">
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  {isBn ? "জেলার আকর্ষণ" : "Explore the District"}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {isBn
                    ? `${name}-এর দর্শনীয় স্থান`
                    : `Tourist Attractions in ${name}`}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {isBn
                    ? `${places.length}টি স্থান পাওয়া গেছে`
                    : `${places.length} places found`}
                </p>
              </div>

              {places.length ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {places.map((place) => (
                    <PlaceCard
                      key={place._id || place.slug}
                      place={place}
                      language={language}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-10 text-center dark:bg-gray-900">
                  <p className="text-gray-500">
                    {isBn
                      ? "এই জেলার দর্শনীয় স্থানের তথ্য এখনো যোগ করা হয়নি।"
                      : "No published tourist attractions have been added for this district yet."}
                  </p>
                </div>
              )}
            </section>

            {/* Map */}
            <MapSection location={district.location} language={language} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Compass
                size={30}
                className="text-emerald-700 dark:text-emerald-400"
              />

              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {isBn ? "জেলা ভ্রমণের পরিকল্পনা" : "Plan Your District Visit"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {isBn
                  ? "এই জেলার দর্শনীয় স্থানগুলো দেখে আপনার ভ্রমণ পরিকল্পনা তৈরি করুন।"
                  : "Explore attractions in this district and plan your trip."}
              </p>

              <Link
                href="/places"
                className="mt-5 block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                {isBn ? "সকল দর্শনীয় স্থান" : "All tourist places"}
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {isBn ? "বিভাগ" : "Division"}
              </p>

              <p className="mt-3 font-semibold text-gray-900 dark:text-white">
                {division || (isBn ? "তথ্য নেই" : "Not available")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
