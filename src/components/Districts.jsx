
// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { MapPin } from "lucide-react";

// export default function Districts({
//   districts = [],
//   language = "en",
// }) {
//   // Keep the first server/client render consistent.
//   const [hydrated, setHydrated] = useState(false);

//   // Run only after the component mounts in the browser.
//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   // Use English until hydration is complete.
//   const currentLanguage = hydrated ? language : "en";
//   const isBangla = currentLanguage === "bn";

//   return (
//     <section className="mx-auto max-w-[1400px] px-5 py-12">
//       <div className="mb-7 flex items-center justify-between gap-4">
//         <h2 className="section-title">
//           {isBangla
//             ? "প্রতিটি জেলার সেরা স্থান"
//             : "Best Places in Every District"}
//         </h2>

//         <Link
//           href="/districts"
//           className="shrink-0 text-sm font-bold text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
//         >
//           {isBangla ? "সব জেলা →" : "View All Districts →"}
//         </Link>
//       </div>

//       {districts.length > 0 ? (
//         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
//           {districts.map((district) => {
//             const districtName =
//               typeof district.name === "object"
//                 ? district.name?.[currentLanguage] ||
//                   district.name?.en ||
//                   district.name?.bn ||
//                   "District"
//                 : district.name || "District";

//             return (
//               <Link
//                 href={`/districts/${district.slug}`}
//                 key={district._id || district.slug}
//                 className="group relative h-36 overflow-hidden rounded-xl shadow-md md:h-40"
//               >
//                 <Image
//                   src={district.coverImage || "/images/placeholder.jpg"}
//                   alt={districtName}
//                   fill
//                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
//                   className="object-cover transition duration-500 group-hover:scale-110"
//                 />

//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

//                 <div className="absolute bottom-3 left-3 flex items-center gap-1 text-sm font-semibold text-white">
//                   <MapPin size={14} aria-hidden="true" />
//                   <span>{districtName}</span>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="rounded-xl bg-slate-100 py-12 text-center dark:bg-slate-900">
//           <p className="text-slate-600 dark:text-slate-300">
//             {isBangla
//               ? "এখনো কোনো জেলার তথ্য পাওয়া যায়নি।"
//               : "No district information available yet."}
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }



import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useAppSettings } from "./ThemeLanguageProvider";

export default function Districts({ districts = [] }) {
  const { language } = useAppSettings();

  return (
    <section className="max-w-[1400px] mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-7">
        <h2 className="section-title">
          {language === "bn"
            ? "প্রতিটি জেলার সেরা স্থান"
            : "Best Places in Every District"}
        </h2>

        <Link href="/districts" className="text-green-700 font-bold text-sm">
          {language === "bn" ? "সব জেলা →" : "View All Districts →"}
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {districts.map((district) => (
          <Link
            href={`/districts/${district.slug}`}
            key={district._id}
            className="group relative h-36 md:h-40 rounded-xl overflow-hidden shadow-md"
          >
            <Image
              src={district.coverImage || "/images/placeholder.jpg"}
              alt={district.name?.[language] || "District"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
              className="object-cover group-hover:scale-110 transition duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 text-white font-semibold text-sm flex items-center gap-1">
              <MapPin size={14} />
              {district.name?.[language]}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}