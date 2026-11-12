import DistrictsClient from "./DistrictsClient";

export const metadata = {
  title: "Explore All 64 Districts of Bangladesh",
  description:
    "Discover Bangladesh's 64 districts, their tourist attractions, cultural heritage, history and natural beauty.",
  alternates: {
    canonical: "/districts",
  },
  openGraph: {
    title: "Explore All Districts of Bangladesh",
    description:
      "Discover the places, culture and attractions of Bangladesh's districts.",
    type: "website",
  },
};

export default function DistrictsPage() {
  return <DistrictsClient />;
}