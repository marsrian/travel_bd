import {
  Clock,
  CalendarDays,
  Ticket,
  Info,
} from "lucide-react";

import {
  getText,
  getTicketPrice,
  getWeeklyClosedDays,
} from "@/lib/tourism";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
      <div className="mt-1 text-emerald-700 dark:text-emerald-400">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default function VisitingInfo({
  place,
  language = "en",
}) {
  const info = place.visitingInfo || {};
  const isBn = language === "bn";

  const openingHours =
    info.openingTime || info.closingTime
      ? `${info.openingTime || "—"} – ${info.closingTime || "—"}`
      : isBn
        ? "তথ্য নেই"
        : "Not available";

  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">
        {isBn ? "ভ্রমণের তথ্য" : "Visitor Information"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem
          icon={Clock}
          label={isBn ? "খোলা ও বন্ধের সময়" : "Opening hours"}
          value={openingHours}
        />

        <InfoItem
          icon={CalendarDays}
          label={isBn ? "সাপ্তাহিক বন্ধ" : "Weekly closing days"}
          value={getWeeklyClosedDays(info.weeklyClosed, language)}
        />

        <InfoItem
          icon={Ticket}
          label={isBn ? "প্রবেশ মূল্য" : "Entry / Ticket price"}
          value={getTicketPrice(info, language)}
        />

        <InfoItem
          icon={Info}
          label={isBn ? "প্রবেশের ধরন" : "Entry type"}
          value={
            info.entryType === "free"
              ? isBn ? "বিনামূল্যে" : "Free entry"
              : info.entryType === "paid"
                ? isBn ? "টিকিট প্রয়োজন" : "Paid entry"
                : isBn ? "তথ্য যাচাই করা প্রয়োজন" : "Please verify"
          }
        />
      </div>

      {info.notes && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {getText(info.notes, language)}
        </p>
      )}
    </section>
  );
}