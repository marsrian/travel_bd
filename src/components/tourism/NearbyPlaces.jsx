import PlaceCard from "./PlaceCard";

export default function NearbyPlaces({
  places = [],
  language = "en",
  currentSlug,
}) {
  const nearby = places
    .filter((place) => place.slug !== currentSlug)
    .slice(0, 4);

  if (!nearby.length) return null;

  return (
    <section>
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          {language === "bn" ? "আরও ঘুরে দেখুন" : "Explore More"}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {language === "bn" ? "কাছাকাছি দর্শনীয় স্থান" : "Nearby Attractions"}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {nearby.map((place) => (
          <PlaceCard
            key={place._id || place.slug}
            place={place}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}