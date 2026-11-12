
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName =
  process.env.MONGODB_DB || "bangladesh_tourism";

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const client = new MongoClient(uri);

const now = new Date();

const districts = [
  {
    name: { en: "Dhaka", bn: "ঢাকা" },
    slug: "dhaka",
    division: { en: "Dhaka", bn: "ঢাকা" },
    description: {
      en: "Explore the capital of Bangladesh.",
      bn: "বাংলাদেশের রাজধানী আবিষ্কার করুন।",
    },
    coverImage: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=900",
    isFeatured: true,
    status: "published",
  },
  {
    name: { en: "Sylhet", bn: "সিলেট" },
    slug: "sylhet",
    division: { en: "Sylhet", bn: "সিলেট" },
    description: {
      en: "Explore the green landscapes of Sylhet.",
      bn: "সিলেটের সবুজ প্রাকৃতিক সৌন্দর্য উপভোগ করুন।",
    },
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
    isFeatured: true,
    status: "published",
  },
  {
    name: { en: "Cox's Bazar", bn: "কক্সবাজার" },
    slug: "cox-bazar",
    division: { en: "Chattogram", bn: "চট্টগ্রাম" },
    description: {
      en: "Discover the famous sea beach.",
      bn: "বিখ্যাত সমুদ্র সৈকতের সৌন্দর্য আবিষ্কার করুন।",
    },
    coverImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900",
    isFeatured: true,
    status: "published",
  },
];

const places = [
  {
    name: {
      en: "Ratargul Swamp Forest",
      bn: "রাতারগুল সোয়াম্প ফরেস্ট",
    },
    slug: "ratargul-swamp-forest",
    districtSlug: "sylhet",
    districtName: { en: "Sylhet", bn: "সিলেট" },
    category: {
      slug: "forest",
      en: "Forest",
      bn: "বন",
    },
    summary: {
      en: "A beautiful freshwater swamp forest.",
      bn: "একটি সুন্দর মিঠাপানির জলাবন।",
    },
    history: {
      en: "Add verified historical information.",
      bn: "যাচাইকৃত ঐতিহাসিক তথ্য যোগ করুন।",
    },
    visitingInfo: {
      openingTime: "08:00",
      closingTime: "17:00",
      weeklyClosed: [],
      ticketPrice: null,
      currency: "BDT",
      entryType: "unknown",
    },
    location: {
      address: {
        en: "Gowainghat, Sylhet",
        bn: "গোয়াইনঘাট, সিলেট",
      },
      latitude: null,
      longitude: null,
      googleMapsUrl: "",
    },
    transportation: [],
    bestVisitingTime: {
      en: "June to September",
      bn: "জুন থেকে সেপ্টেম্বর",
    },
    coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
    images: [],
    isFeatured: true,
    status: "published",
  },
  {
    name: {
      en: "Cox's Bazar Sea Beach",
      bn: "কক্সবাজার সমুদ্র সৈকত",
    },
    slug: "cox-bazar-sea-beach",
    districtSlug: "cox-bazar",
    districtName: {
      en: "Cox's Bazar",
      bn: "কক্সবাজার",
    },
    category: {
      slug: "beach",
      en: "Beach",
      bn: "সমুদ্র সৈকত",
    },
    summary: {
      en: "A famous coastal tourist destination.",
      bn: "একটি বিখ্যাত উপকূলীয় পর্যটন কেন্দ্র।",
    },
    history: {
      en: "Add verified historical information.",
      bn: "যাচাইকৃত ঐতিহাসিক তথ্য যোগ করুন।",
    },
    visitingInfo: {
      openingTime: null,
      closingTime: null,
      weeklyClosed: [],
      ticketPrice: 0,
      currency: "BDT",
      entryType: "free",
    },
    location: {
      address: {
        en: "Cox's Bazar, Bangladesh",
        bn: "কক্সবাজার, বাংলাদেশ",
      },
      latitude: null,
      longitude: null,
      googleMapsUrl: "",
    },
    transportation: [],
    bestVisitingTime: {
      en: "November to February",
      bn: "নভেম্বর থেকে ফেব্রুয়ারি",
    },
    coverImage: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900",
    images: [],
    isFeatured: true,
    status: "published",
  },
];

async function seedDatabase() {
  try {
    await client.connect();

    const db = client.db(dbName);

    // Create indexes
    await db.collection("districts").createIndex(
      { slug: 1 },
      { unique: true }
    );

    await db.collection("places").createIndex(
      { slug: 1 },
      { unique: true }
    );

    await db.collection("places").createIndex({
      status: 1,
      isFeatured: 1,
    });

    await db.collection("places").createIndex({
      districtSlug: 1,
      status: 1,
    });

    await db.collection("events").createIndex({
      startsAt: 1,
      status: 1,
    });

    await db.collection("guides").createIndex(
      { slug: 1 },
      { unique: true }
    );

    // Insert or update districts
    for (const district of districts) {
      await db.collection("districts").updateOne(
        { slug: district.slug },
        {
          $set: {
            ...district,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }

    // Insert or update places
    for (const place of places) {
      await db.collection("places").updateOne(
        { slug: place.slug },
        {
          $set: {
            ...place,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedDatabase();
