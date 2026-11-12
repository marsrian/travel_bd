import PlacesClient from "./PlacesClient";

export const metadata = {
  title: "Tourist Places in Bangladesh",
  description:
    "Explore the best tourist attractions, historical sites, beaches, forests and natural destinations across Bangladesh.",
  alternates: {
    canonical: "/places",
  },
  openGraph: {
    title: "Explore Tourist Places in Bangladesh",
    description:
      "Discover beautiful destinations and travel experiences across Bangladesh.",
    type: "website",
  },
};

export default function PlacesPage() {
  return <PlacesClient />;
}