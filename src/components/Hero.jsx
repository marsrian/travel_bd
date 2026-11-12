"use client";

import { Search, ArrowRight } from "lucide-react";

export default function Hero({ language = "en", search, setSearch }) {
  const isBangla = language === "bn";

  return (
    <section
      className="relative flex min-h-120 items-center bg-cover bg-center md:min-h-137.5"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(0,30,20,.85), rgba(0,30,20,.1)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800')",
      }}
    >
      <div className="mx-auto w-full max-w-350 px-6 py-20">
        <div className="max-w-2xl text-white">
          <p className="mb-2 text-2xl font-bold italic text-yellow-400 md:text-4xl">
            {isBangla ? "স্বাগতম" : "Welcome to"}
          </p>

          <h2 className="mb-4 text-5xl font-black md:text-7xl">
            {isBangla ? "বাংলাদেশ" : "Bangladesh"}
          </h2>

          <h3 className="mb-5 text-xl font-bold md:text-2xl">
            {isBangla
              ? "প্রকৃতির সৌন্দর্যে ভ্রমণের নতুন ঠিকানা"
              : "Discover the Beauty of Our Land"}
          </h3>

          <p className="mb-8 max-w-lg text-base text-white/90 md:text-lg">
            {isBangla
              ? "নদী, পাহাড়, সমুদ্র আর ঐতিহাসিক স্থানের সৌন্দর্য আবিষ্কার করুন।"
              : "From tranquil rivers to historical landmarks, explore the best tourist spots across Bangladesh."}
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-xl rounded-full bg-white p-1.5 shadow-xl"
          >
            <Search className="ml-4 self-center text-green-800" size={20} />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isBangla
                  ? "স্থান, জেলা অথবা ইভেন্ট খুঁজুন..."
                  : "Search places, districts or events..."
              }
              aria-label={isBangla ? "অনুসন্ধান করুন" : "Search"}
              className="min-w-0 flex-1 rounded-full px-3 py-3 text-slate-800 outline-none"
            />

            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-green-700 px-6 font-bold text-white transition hover:bg-green-800 md:px-8"
            >
              {isBangla ? "খুঁজুন" : "Search"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="mt-7 flex flex-wrap gap-3 text-sm text-white/90">
            <span>#Cox&apos;sBazar</span>
            <span>#Sundarbans</span>
            <span>#SajekValley</span>
            <span>#Sylhet</span>
          </div>
        </div>
      </div>
    </section>
  );
}
