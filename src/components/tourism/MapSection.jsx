import { ExternalLink, MapPin } from "lucide-react";

import {
  getMapsUrl,
  getMapsEmbedUrl,
  getText,
} from "@/lib/tourism";

export default function MapSection({
  location,
  language = "en",
}) {
  const mapUrl = getMapsUrl(location);
  const embedUrl = getMapsEmbedUrl(location);

  const address = getText(location?.address, language);

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">
        {language === "bn" ? "অবস্থান ও মানচিত্র" : "Location & Map"}
      </h2>

      {address && (
        <p className="mb-4 flex items-start gap-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          <MapPin size={19} className="mt-1 shrink-0 text-emerald-600" />
          {address}
        </p>
      )}

      {embedUrl ? (
        <iframe
          title="Destination location on Google Maps"
          src={embedUrl}
          width="100%"
          height="350"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-2xl border-0"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800">
          {language === "bn" ? "মানচিত্রের তথ্য পাওয়া যায়নি" : "Map information unavailable"}
        </div>
      )}

      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          {language === "bn" ? "Google Maps-এ খুলুন" : "Open in Google Maps"}
          <ExternalLink size={16} />
        </a>
      )}
    </section>
  );
}