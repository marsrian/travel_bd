
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  getText,
  getImageUrl,
} from "@/lib/tourism";

export default function PlaceCard({
  place,
  language = "en",
}) {
  const isBn = language === "bn";

  const name = getText(place?.name, language);
  const district = getText(place?.districtName, language);
  const summary = getText(place?.summary, language);

  const categoryName = getText(
    place?.category?.name || place?.category,
    language
  );

  const imageUrl = getImageUrl(place?.coverImage);

  return (
    <Link
      href={`/places/${place.slug}`}
      aria-label={`${name} - ${isBn ? "বিস্তারিত দেখুন" : "Explore destination"}`}
      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Place Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={name || "Tourist destination"}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {categoryName && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800 backdrop-blur">
            {categoryName}
          </span>
        )}
      </div>

      {/* Place Information */}
      <div className="p-5">
        {/* District */}
        <div className="mb-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <MapPin size={16} />

          <span>
            {district || (isBn ? "বাংলাদেশ" : "Bangladesh")}
          </span>
        </div>

        {/* Place Name */}
        <h2 className="text-xl font-bold text-gray-900 transition group-hover:text-emerald-700 dark:text-white">
          {name}
        </h2>

        {/* Summary */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {summary}
        </p>

        {/* Explore Link */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-emerald-700 dark:border-gray-800 dark:text-emerald-400">
          <span>
            {isBn ? "বিস্তারিত দেখুন" : "Explore destination"}
          </span>

          <ArrowUpRight
            size={18}
            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </Link>
  );
}
