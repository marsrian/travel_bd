
"use client";

import { useEffect, useState } from "react";
import { useAppSettings } from "@/components/ThemeLanguageProvider";

import Hero from "@/components/Hero";
import FeaturedPlaces from "@/components/FeaturedPlaces";
import StatsBanner from "@/components/StatsBanner";
import Districts from "@/components/Districts";
import TravelGuide from "@/components/TravelGuide";
import Events from "@/components/Events";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  const { language, settingsLoaded } = useAppSettings();

  const [search, setSearch] = useState("");

  const [homepageData, setHomepageData] = useState({
    places: [],
    districts: [],
    events: [],
    guides: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentLanguage = settingsLoaded ? language : "en";

  // Fetch homepage data
  async function fetchHomepageData(signal) {
  const response = await fetch("/api/homepage", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error("Invalid homepage API response.");
  }

  return {
    places: Array.isArray(result.data.places) ? result.data.places : [],
    districts: Array.isArray(result.data.districts)
      ? result.data.districts
      : [],
    events: Array.isArray(result.data.events) ? result.data.events : [],
    guides: Array.isArray(result.data.guides) ? result.data.guides : [],
  };
}

  // Initial homepage data fetch
  useEffect(() => {
  const controller = new AbortController();

  async function loadHomepage() {
    try {
      const data = await fetchHomepageData(controller.signal);

      if (!controller.signal.aborted) {
        setHomepageData(data);
        setError("");
      }
    } catch (err) {
      if (err.name === "AbortError" || controller.signal.aborted) return;

      console.error("Homepage API error:", err);
      setError("Unable to load homepage data. Please try again.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  loadHomepage();

  return () => controller.abort();
}, []);

  // Retry homepage data fetch
  async function handleRetry() {
  const controller = new AbortController();

  setLoading(true);
  setError("");

  try {
    const data = await fetchHomepageData(controller.signal);

    if (!controller.signal.aborted) {
      setHomepageData(data);
    }
  } catch (err) {
    if (err.name === "AbortError") return;

    console.error("Homepage API error:", err);
    setError("Unable to load homepage data. Please try again.");
  } finally {
    if (!controller.signal.aborted) {
      setLoading(false);
    }
  }
}

  return (
    <main>
      <div className="min-h-screen bg-[#f7faf8] text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <Hero
          language={currentLanguage}
          search={search}
          setSearch={setSearch}
        />

        <FeaturedPlaces
          language={currentLanguage}
          search={search}
          places={homepageData.places}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />

        <StatsBanner language={currentLanguage} />

        <Districts
          language={currentLanguage}
          districts={homepageData.districts}
        />

        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TravelGuide
              language={currentLanguage}
              guides={homepageData.guides}
            />
          </div>

          <div>
            <Events
              language={currentLanguage}
              events={homepageData.events}
            />
          </div>
        </div>

        <Newsletter language={currentLanguage} />

        <Footer language={currentLanguage} />
      </div>
    </main>
  );
}
