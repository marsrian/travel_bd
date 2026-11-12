
export const DEFAULT_LANGUAGE = "en";

// Convert English digits to Bengali digits
export function formatNumber(value, language = "en") {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (language !== "bn") {
    return text;
  }

  const bengaliDigits = "০১২৩৪৫৬৭৮৯";

  return text.replace(/[0-9]/g, (digit) => {
    return bengaliDigits[Number(digit)];
  });
}

export function getText(value, language = "en") {
  if (!value) return "";

  if (typeof value === "string") return value;

  return value[language] || value.en || value.bn || "";
}

export function getImageUrl(image, fallback = "/images/placeholder.jpg") {
  if (!image) return fallback;

  if (typeof image === "string") return image;

  return image.url || image.src || fallback;
}

export function getPlaceImages(place) {
  const images = Array.isArray(place?.images)
    ? place.images
    : [];

  const cover = place?.coverImage
    ? [place.coverImage]
    : [];

  return [...cover, ...images]
    .map((image) => getImageUrl(image, ""))
    .filter(Boolean)
    .filter((url, index, array) => array.indexOf(url) === index);
}

export function formatDate(date, language = "en") {
  if (!date) return "";

  const locale = language === "bn" ? "bn-BD" : "en-BD";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getTicketPrice(visitingInfo, language = "en") {
  if (!visitingInfo) {
    return language === "bn" ? "তথ্য নেই" : "Not available";
  }

  const entryType = visitingInfo.entryType;
  const price = visitingInfo.ticketPrice;
  const currency = visitingInfo.currency || "BDT";

  if (entryType === "free" || price === 0) {
    return language === "bn" ? "বিনামূল্যে" : "Free";
  }

  if (entryType === "unknown" || price == null) {
    return language === "bn" ? "তথ্য নেই" : "Not available";
  }

  return `${currency} ${formatNumber(price, language)}`;
}

export function getWeeklyClosedDays(days, language = "en") {
  if (!Array.isArray(days) || days.length === 0) {
    return language === "bn" ? "নির্ধারিত নয়" : "Not specified";
  }

  if (language === "en") return days.join(", ");

  const translations = {
    Saturday: "শনিবার",
    Sunday: "রবিবার",
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
    Friday: "শুক্রবার",
  };

  return days.map((day) => translations[day] || day).join(", ");
}

export function getMapsUrl(location) {
  if (!location) return "";

  if (location.googleMapsUrl) {
    return location.googleMapsUrl;
  }

  const { latitude, longitude, address } = location;

  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      getText(address)
    )}`;
  }

  return "";
}

export function getMapsEmbedUrl(location) {
  if (!location) return "";

  const { latitude, longitude, address } = location;

  let query = "";

  if (latitude != null && longitude != null) {
    query = `${latitude},${longitude}`;
  } else if (address) {
    query = getText(address);
  }

  if (!query) return "";

  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&output=embed`;
}

export async function fetchApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to load tourism data."
    );
  }

  return result;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function fetchServerApi(path) {
  const response = await fetch(`${getSiteUrl()}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) return null;

  const result = await response.json();

  return result.success ? result.data : null;
}
