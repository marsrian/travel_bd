
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Clock,
  Ticket,
  MapPin,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const categoryLabels = {
  nature: {
    en: "Nature",
    bn: "প্রকৃতি",
  },
  waterfalls: {
    en: "Waterfalls",
    bn: "জলপ্রপাত",
  },
  beach: {
    en: "Beach",
    bn: "সমুদ্র সৈকত",
  },
  forest: {
    en: "Forest",
    bn: "বন",
  },
  historical: {
    en: "Historical",
    bn: "ঐতিহাসিক",
  },
  historical_place: {
    en: "Historical",
    bn: "ঐতিহাসিক",
  },
  adventure: {
    en: "Adventure",
    bn: "অ্যাডভেঞ্চার",
  },
};

export default function FeaturedPlaces({
  language = "en",
  search = "",
  places = [],
  loading = false,
  error = "",
  onRetry,
}) {
  const isBangla = language === "bn";

  function toBanglaNumber(value) {
    const digits = "০১২৩৪৫৬৭৮৯";

    return String(value).replace(/[0-9]/g, (digit) => {
      return digits[Number(digit)];
    });
  }

  function getLocalizedValue(value) {
    if (value && typeof value === "object") {
      return value[language] || value.en || "";
    }

    return value ?? "";
  }

  function getPlaceName(place) {
    return (
      getLocalizedValue(place.name) ||
      place.slug ||
      (isBangla ? "পর্যটন স্থান" : "Tourist place")
    );
  }

  function getDistrictName(place) {
    return getLocalizedValue(place.districtName);
  }

  function getCategory(place) {
    const category = place.category;

    if (!category) return "";

    // Your API currently returns category as a string.
    if (typeof category === "string") {
      return (
        categoryLabels[category.toLowerCase()]?.[language] ||
        category.replace(/_/g, " ")
      );
    }

    // Also supports localized category objects.
    return getLocalizedValue(category);
  }

  function getOpeningTime(place) {
    const info = place.visitingInfo || {};

    const opening = info.openingTime;
    const closing = info.closingTime;

    if (!opening || !closing) {
      return isBangla ? "সময় যাচাই করুন" : "Check hours";
    }

    return `${opening} – ${closing}`;
  }

  function getTicketPrice(place) {
    const info = place.visitingInfo || {};
    const price = info.ticketPrice;

    if (info.entryType === "free") {
      return isBangla ? "বিনামূল্যে" : "Free";
    }

    if (price === null || price === undefined || price === "") {
      return isBangla ? "যাচাই করুন" : "Check locally";
    }

    // Your API may return { en: "Free", bn: "বিনামূল্যে" }.
    if (typeof price === "object") {
      return getLocalizedValue(price);
    }

    // Numeric ticket price.
    if (typeof price === "number") {
      return isBangla
        ? `৳${toBanglaNumber(price)}`
        : `BDT ${price}`;
    }

    return String(price);
  }

  const filteredPlaces = places.filter((place) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    const searchableValues = [
      place.name?.en,
      place.name?.bn,
      place.districtName?.en,
      place.districtName?.bn,
      place.slug,
      getCategory(place),
    ];

    return searchableValues.some((value) =>
      String(value || "").toLowerCase().includes(term)
    );
  });

  // Loading state
  if (loading) {
    return (
      <section className="mx-auto max-w-[1400px] px-5 py-12">
        <div className="mb-7 flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-slate-900"
            >
              <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-4 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-12">
      <div className="mb-7 flex items-center justify-between gap-4">
        <h2 className="section-title">
          {isBangla
            ? "জনপ্রিয় পর্যটন স্থান"
            : "Featured Tourist Places"}
        </h2>

        <Link
          href="/places"
          className="shrink-0 text-sm font-bold text-green-700 transition hover:text-green-800 dark:text-green-400"
        >
          {isBangla ? "সব দেখুন →" : "View All →"}
        </Link>
      </div>

      {/* Error state */}
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-10 text-center dark:border-red-900 dark:bg-red-950/30"
        >
          <p className="mb-4 text-slate-700 dark:text-slate-200">
            {isBangla
              ? "পর্যটন স্থানগুলো লোড করা যায়নি। আবার চেষ্টা করুন।"
              : error}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <RefreshCw size={16} />
              {isBangla ? "আবার চেষ্টা করুন" : "Try Again"}
            </button>
          )}
        </div>
      ) : filteredPlaces.length === 0 ? (
        /* Empty state */
        <div className="py-10 text-center text-slate-500 dark:text-slate-400">
          {search.trim()
            ? isBangla
              ? "আপনার অনুসন্ধানের সঙ্গে মেলে এমন কোনো পর্যটন স্থান পাওয়া যায়নি।"
              : "No tourist places match your search."
            : isBangla
              ? "বর্তমানে কোনো জনপ্রিয় পর্যটন স্থান পাওয়া যায়নি।"
              : "No featured tourist places available right now."}
        </div>
      ) : (
        /* Featured places grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPlaces.map((place) => {
            const placeName = getPlaceName(place);
            const districtName = getDistrictName(place);
            const category = getCategory(place);

            const placeUrl = `/places/${place.slug}`;

            return (
              <article
                key={place._id || place.slug}
                className="group overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl dark:bg-slate-900"
              >
                <Link href={placeUrl}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={
                        place.coverImage ||
                        "/images/placeholder.jpg"
                      }
                      alt={placeName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-110"
                    />

                    {districtName && (
                      <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        <MapPin size={13} />
                        {districtName}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                    <Link
                      href={placeUrl}
                      className="transition hover:text-green-700 dark:hover:text-green-400"
                    >
                      {placeName}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {getOpeningTime(place)}
                    </span>

                    <span className="flex items-center gap-1">
                      <Ticket size={14} />
                      {getTicketPrice(place)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                      {category}
                    </span>

                    <Link
                      href={placeUrl}
                      aria-label={
                        isBangla
                          ? `${placeName} সম্পর্কে জানুন`
                          : `Explore ${placeName}`
                      }
                      className="rounded-full bg-green-50 p-2 text-green-700 transition hover:bg-green-700 hover:text-white dark:bg-slate-800 dark:text-green-400"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
