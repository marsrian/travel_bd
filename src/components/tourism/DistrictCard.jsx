import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { getText, getImageUrl } from "@/lib/tourism";

export default function DistrictCard({
  district,
  language = "en",
}) {
  const name = getText(district.name, language);
  const division = getText(district.division, language);

  return (
    <Link
      href={`/districts/${district.slug}`}
      className="group relative block h-72 overflow-hidden rounded-2xl bg-gray-900"
    >
      <Image
        src={getImageUrl(district.coverImage)}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        className="object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="mb-2 flex items-center gap-2 text-sm text-emerald-200">
          <MapPin size={15} />
          {division}
        </p>

        <h2 className="text-2xl font-bold">{name}</h2>

        <p className="mt-2 text-sm text-gray-200">
          {language === "bn" ? "জেলা ঘুরে দেখুন" : "Explore district"} →
        </p>
      </div>
    </Link>
  );
}