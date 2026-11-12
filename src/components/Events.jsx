
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Events({
  events = [],
  language = "en",
}) {
  const isBangla = language === "bn";

  function getLocalizedValue(value) {
    if (typeof value === "object" && value !== null) {
      return value[language] || value.en || value.bn || "";
    }

    return value || "";
  }

  function formatDate(date) {
    if (!date) {
      return { day: "--", month: "---" };
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return { day: "--", month: "---" };
    }

    const locale = isBangla ? "bn-BD" : "en-US";

    return {
      day: parsed.toLocaleDateString(locale, {
        day: "2-digit",
      }),
      month: parsed.toLocaleDateString(locale, {
        month: "short",
      }),
    };
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="section-title">
          {isBangla ? "আসন্ন অনুষ্ঠান" : "Upcoming Events"}
        </h2>

        <Link
          href="/events"
          className="shrink-0 text-sm font-bold text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        >
          {isBangla ? "সব দেখুন" : "View All"}
        </Link>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const date = formatDate(event.startsAt);
          const title = getLocalizedValue(event.title);
          const location = getLocalizedValue(event.location);

          return (
            <Link
              href={`/events/${event.slug}`}
              key={event._id || event.slug}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-900"
            >
              <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-green-700 text-white">
                <strong className="text-lg leading-none">
                  {date.day}
                </strong>

                <span className="text-[10px] uppercase">
                  {date.month}
                </span>
              </div>

              <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={
                    event.coverImage || "/images/placeholder.jpg"
                  }
                  alt={title || "Event"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">
                  {title || (isBangla ? "অনুষ্ঠান" : "Event")}
                </h3>

                {location && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{location}</span>
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {events.length === 0 && (
          <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {isBangla
              ? "বর্তমানে কোনো প্রকাশিত আসন্ন অনুষ্ঠান নেই।"
              : "No upcoming published events."}
          </p>
        )}
      </div>
    </section>
  );
}
