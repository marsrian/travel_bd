
"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { getPlaceImages } from "@/lib/tourism";

export default function ImageGallery({
  place,
  language = "en",
}) {
  const images = getPlaceImages(place);
  const [activeImage, setActiveImage] = useState(0);

  const title =
    typeof place.name === "string"
      ? place.name
      : place.name?.[language] || place.name?.en || "Destination";

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800">
        <div className="text-center">
          <ImageOff size={35} className="mx-auto mb-2" />
          <p>
            {language === "bn"
              ? "ছবি পাওয়া যায়নি"
              : "No images available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative h-[300px] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 sm:h-[480px]">
        <Image
          src={images[activeImage]}
          alt={title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 1200px"
          className="object-cover"
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={activeImage === index}
              className={`relative h-20 overflow-hidden rounded-xl border-2 ${
                activeImage === index
                  ? "border-emerald-600"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image}
                alt={`${title} ${index + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, 20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
