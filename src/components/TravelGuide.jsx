
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";

export default function TravelGuide({
  guides = [],
  language = "en",
}) {
  const isBangla = language === "bn";

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="section-title">
          {isBangla ? "ভ্রমণ গাইড" : "Travel Guide"}
        </h2>

        <Link
          href="/travel-guide"
          className="shrink-0 text-sm font-bold text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
        >
          {isBangla ? "সব দেখুন" : "View All"}
        </Link>
      </div>

      <div className="space-y-4">
        {guides.map((guide) => {
          const title =
            typeof guide.title === "object"
              ? guide.title?.[language] ||
                guide.title?.en ||
                guide.title?.bn
              : guide.title;

          const publishedDate = guide.publishedAt
            ? new Date(guide.publishedAt)
            : null;

          const formattedDate =
            publishedDate && !Number.isNaN(publishedDate.getTime())
              ? publishedDate.toLocaleDateString(
                  isBangla ? "bn-BD" : "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "";

          return (
            <Link
              href={`/travel-guide/${guide.slug}`}
              key={guide._id || guide.slug}
              className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-slate-900"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={
                    guide.coverImage || "/images/placeholder.jpg"
                  }
                  alt={title || "Travel guide"}
                  fill
                  sizes="96px"
                  className="object-cover transition duration-300 hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white md:text-base">
                  {title || (isBangla ? "ভ্রমণ গাইড" : "Travel Guide")}
                </h3>

                {formattedDate && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays size={13} />
                    <span>{formattedDate}</span>
                  </p>
                )}
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-green-700 dark:text-green-400"
              />
            </Link>
          );
        })}

        {guides.length === 0 && (
          <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {isBangla
              ? "এখনো কোনো ভ্রমণ গাইড প্রকাশিত হয়নি।"
              : "No travel guides published yet."}
          </p>
        )}
      </div>
    </section>
  );
}
