import PlaceDetailsClient from "./PlaceDetailsClient";
import { fetchServerApi, getText } from "@/lib/tourism";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const place = await fetchServerApi(
    `/api/places/${encodeURIComponent(slug)}`
  );

  if (!place) {
    return {
      title: "Destination Not Found | Bangladesh Tourism",
      robots: { index: false, follow: false },
    };
  }

  const title = getText(place.name, "en");
  const description =
    getText(place.summary, "en") ||
    `Explore ${title}, a tourist destination in Bangladesh.`;

  const image =
    typeof place.coverImage === "string"
      ? place.coverImage
      : place.coverImage?.url;

  return {
    title: `${title} | Bangladesh Tourism`,
    description,
    alternates: {
      canonical: `/places/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PlaceDetailsPage({ params }) {
  const { slug } = await params;

  return <PlaceDetailsClient slug={slug} />;
}