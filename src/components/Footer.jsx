
import Link from "next/link";
import { Mountain } from "lucide-react";

export default function Footer({ language = "en" }) {
  const isBangla = language === "bn";

  const links = [
    { en: "Home", bn: "হোম", href: "/" },
    { en: "Places", bn: "স্থানসমূহ", href: "/places" },
    { en: "Districts", bn: "জেলাসমূহ", href: "/districts" },
    { en: "Events", bn: "ইভেন্ট", href: "/events" },
    { en: "Travel Guide", bn: "ভ্রমণ গাইড", href: "/travel-guide" },
  ];

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-3">
            <Mountain size={42} className="text-green-500" />

            <h2 className="text-xl font-extrabold">
              Bangladesh
              <br />
              Tourism
            </h2>
          </Link>

          <p className="text-sm leading-7 text-slate-400">
            {isBangla
              ? "বাংলাদেশের সৌন্দর্য আবিষ্কার করুন, নতুন ভ্রমণের অভিজ্ঞতা গড়ুন।"
              : "Explore the beauty of Bangladesh and discover new travel experiences."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 font-bold">
            {isBangla ? "দ্রুত লিংক" : "Quick Links"}
          </h3>

          <ul className="space-y-3 text-sm text-slate-400">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-green-400"
                >
                  {isBangla ? link.bn : link.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="mb-5 font-bold">
            {isBangla ? "আমাদের সম্পর্কে" : "About Us"}
          </h3>

          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <Link href="/about" className="transition hover:text-green-400">
                {isBangla ? "আমাদের পরিচিতি" : "About Bangladesh Tourism"}
              </Link>
            </li>

            <li>
              <Link href="/contact" className="transition hover:text-green-400">
                {isBangla ? "যোগাযোগ" : "Contact Us"}
              </Link>
            </li>

            <li>
              <Link href="/privacy" className="transition hover:text-green-400">
                {isBangla ? "গোপনীয়তা নীতি" : "Privacy Policy"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="mb-5 font-bold">
            {isBangla ? "আমাদের অনুসরণ করুন" : "Follow Us"}
          </h3>

          <p className="text-sm text-slate-400">
            {isBangla
              ? "আমাদের সামাজিক যোগাযোগমাধ্যমের লিংক শীঘ্রই যুক্ত করা হবে।"
              : "Our social media links will be added soon."}
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 px-5 py-5">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-3 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Bangladesh Tourism.{" "}
            {isBangla ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>

          <p>
            {isBangla
              ? "বাংলাদেশে ❤️ দিয়ে তৈরি"
              : "Made with ❤️ in Bangladesh"}{" "}
            🇧🇩
          </p>
        </div>
      </div>
    </footer>
  );
}
