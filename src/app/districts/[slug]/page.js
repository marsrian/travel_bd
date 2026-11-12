
import { Suspense } from "react";
import { cacheLife } from "next/cache";

import DistrictDetailsClient from "./DistrictDetailsClient";
import { fetchServerApi, getText } from "@/lib/tourism";

// ========================================
// Cached District Data for Metadata
// ========================================

async function getDistrictMetadata(slug) {
  "use cache";

  cacheLife("hours");

  return fetchServerApi(
    `/api/districts/${encodeURIComponent(slug)}`
  );
}

// ========================================
// SEO Metadata
// ========================================

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const district = await getDistrictMetadata(slug);

  if (!district) {
    return {
      title: "District Not Found | Bangladesh Tourism",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = getText(district.name, "en");

  const description =
    getText(district.summary, "en") ||
    `Discover tourist attractions and travel information in ${title}, Bangladesh.`;

  const image =
    typeof district.coverImage === "string"
      ? district.coverImage
      : district.coverImage?.url;

  return {
    title: `${title} District | Bangladesh Tourism`,
    description,

    alternates: {
      canonical: `/districts/${slug}`,
    },

    openGraph: {
      title: `${title}, Bangladesh`,
      description,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
  };
}

// ========================================
// District Page Content
// ========================================

async function DistrictDetailsContent({ params }) {
  const { slug } = await params;

  return <DistrictDetailsClient slug={slug} />;
}

// ========================================
// Page Component
// ========================================

export default function DistrictDetailsPage({ params }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7faf8] dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-slate-600 dark:text-slate-300">
              Loading district details...
            </p>
          </div>
        </main>
      }
    >
      <DistrictDetailsContent params={params} />
    </Suspense>
  );
}
