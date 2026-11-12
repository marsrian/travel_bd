"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bus, Clock, MapPin, Compass } from "lucide-react";

import ImageGallery from "@/components/tourism/ImageGallery";
import VisitingInfo from "@/components/tourism/VisitingInfo";
import MapSection from "@/components/tourism/MapSection";
import NearbyPlaces from "@/components/tourism/NearbyPlaces";
import { useAppSettings } from "@/components/ThemeLanguageProvider";

import { getText, getImageUrl } from "@/lib/tourism";

export default function PlaceDetailsClient({ slug }) {
  const { language, setLanguage } = useAppSettings();
  const isBn = language === "bn";

  const [place, setPlace] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [error, setError] = useState("");

  // Current slug data is still loading until it has been processed
  const loading = loadedSlug !== slug;

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlace() {
      try {
        const response = await fetch(
          `/api/places/${encodeURIComponent(slug)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Destination not found.");
        }

        if (controller.signal.aborted) return;

        setPlace(result.data);
        setError("");
        setNearby([]);

        const districtSlug = result.data.districtSlug;

        if (districtSlug) {
          try {
            const nearbyResponse = await fetch(
              `/api/places?district=${encodeURIComponent(districtSlug)}&limit=5`,
              {
                signal: controller.signal,
                cache: "no-store",
              },
            );

            const nearbyResult = await nearbyResponse.json();

            if (controller.signal.aborted) return;

            if (nearbyResponse.ok && nearbyResult.success) {
              setNearby(nearbyResult.data || []);
            }
          } catch (err) {
            if (err.name === "AbortError") {
              throw err;
            }

            // Nearby places are optional.
            // Keep the main place details visible if this request fails.
            console.error("Nearby places loading error:", err);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load destination.");
          setPlace(null);
          setNearby([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadedSlug(slug);
        }
      }
    }

    loadPlace();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-10 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-8 h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="mt-6 h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </main>
    );
  }

  if (error || !place) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isBn ? "স্থানটি পাওয়া যায়নি" : "Destination not found"}
          </h1>

          <p className="mt-3 text-gray-500">{error}</p>

          <Link
            href="/places"
            className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            {isBn ? "সকল স্থান দেখুন" : "Explore all places"}
          </Link>
        </div>
      </main>
    );
  }

  const name = getText(place.name, language);
  const summary = getText(place.summary, language);
  const history = getText(place.history, language);
  const transportation = getText(place.transportation, language);
  const bestTime = getText(place.bestVisitingTime, language);
  const districtName = getText(place.districtName, language);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="relative flex min-h-87.5 items-end overflow-hidden bg-gray-900 sm:min-h-112.5">
        <Image
          src={getImageUrl(place.coverImage)}
          alt={name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
          <Link
            href="/places"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
          >
            <ArrowLeft size={17} />
            {isBn ? "সকল দর্শনীয় স্থান" : "All destinations"}
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-emerald-200">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              {districtName}
            </span>

            {place.category?.name && (
              <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                {getText(place.category.name, language)}
              </span>
            )}
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            {name}
          </h1>

          <p className="mt-4 flex items-center gap-2 text-white/80">
            <MapPin size={17} />
            {districtName || "Bangladesh"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div className="min-w-0 space-y-12">
            <ImageGallery place={place} language={language} />

            {/* Overview */}
            <section>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {isBn ? "গন্তব্য পরিচিতি" : "Destination Overview"}
              </p>

              <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {isBn ? "এই স্থান সম্পর্কে" : "About This Place"}
              </h2>

              <p className="mt-4 whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">
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

                <p className="whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">
                  {history}
                </p>
              </section>
            )}

            {/* Visiting info */}
            <VisitingInfo place={place} language={language} />

            {/* Best visiting time */}
            {bestTime && (
              <section className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-950/40">
                <div className="flex gap-3">
                  <Clock className="mt-1 shrink-0 text-emerald-700 dark:text-emerald-400" />

                  <div>
                    <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-200">
                      {isBn ? "ভ্রমণের সেরা সময়" : "Best Time to Visit"}
                    </h2>

                    <p className="mt-2 leading-7 text-emerald-900 dark:text-emerald-100">
                      {bestTime}
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
                  {isBn ? "কীভাবে যাবেন" : "How to Get There"}
                </h2>

                <p className="whitespace-pre-line text-base leading-8 text-gray-600 dark:text-gray-300">
                  {transportation}
                </p>
              </section>
            )}

            {/* Map */}
            <MapSection location={place.location} language={language} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Compass
                size={30}
                className="text-emerald-700 dark:text-emerald-400"
              />

              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {isBn ? "আপনার ভ্রমণের পরিকল্পনা করুন" : "Plan Your Visit"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {isBn
                  ? "যাত্রার আগে প্রবেশ মূল্য, খোলা থাকার সময় এবং স্থানীয় নিয়ম যাচাই করুন।"
                  : "Check ticket prices, visiting hours and local travel conditions before your journey."}
              </p>

              <Link
                href="/districts"
                className="mt-5 block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {isBn ? "জেলাগুলো দেখুন" : "Explore districts"}
              </Link>
            </div>

            {place.location?.address && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {isBn ? "ঠিকানা" : "Address"}
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {getText(place.location.address, language)}
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Nearby places */}
        <div className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800">
          <NearbyPlaces
            places={nearby}
            currentSlug={place.slug}
            language={language}
          />
        </div>
      </div>
    </main>
  );
}
