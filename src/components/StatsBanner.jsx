import { MapPin, Landmark, CalendarDays, Camera } from "lucide-react";

import { formatNumber } from "@/lib/tourism";

export default function StatsBanner({
  language = "en",
  settingsLoaded = false,
}) {
  // Always use English until saved settings are loaded.
  const currentLanguage = settingsLoaded ? language : "en";
  const isBangla = currentLanguage === "bn";
  
  console.log("StatsBanner:", {
    language,
    settingsLoaded,
    currentLanguage,
  });

  const stats = [
    {
      id: "districts",
      icon: MapPin,
      number: 64,
      en: "Districts",
      bn: "জেলা",
    },
    {
      id: "places",
      icon: Landmark,
      number: "100+",
      en: "Tourist Spots",
      bn: "পর্যটন স্থান",
    },
    {
      id: "events",
      icon: CalendarDays,
      number: null,
      en: "Festivals & Events",
      bn: "উৎসব ও অনুষ্ঠান",
      displayEn: "Events",
      displayBn: "উৎসব",
    },
    {
      id: "guides",
      icon: Camera,
      number: null,
      en: "Tips & Guides",
      bn: "টিপস ও গাইড",
      displayEn: "Travel",
      displayBn: "ভ্রমণ",
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-5">
      <div className="grid grid-cols-2 rounded-2xl bg-green-100 py-8 shadow-sm dark:bg-green-950 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          const displayNumber =
            stat.number !== null
              ? formatNumber(stat.number, currentLanguage)
              : isBangla
                ? stat.displayBn
                : stat.displayEn;

          return (
            <div
              key={stat.id}
              className={`flex flex-col items-center justify-center gap-2 p-4 ${
                index !== 3
                  ? "md:border-r md:border-green-300 dark:md:border-green-800"
                  : ""
              }`}
            >
              <Icon
                size={32}
                className="text-green-800 dark:text-green-400"
                aria-hidden="true"
              />

              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {displayNumber}
              </h3>

              <p className="text-center text-sm text-slate-700 dark:text-slate-300">
                {isBangla ? stat.bn : stat.en}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}