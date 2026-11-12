
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { connectDB } = await import("../src/lib/mongodb.js");

async function createIndexes() {
  try {
    const db = await connectDB();

    // 1. Unique slug indexes
    const slugCollections = [
      { name: "places", indexName: "unique_place_slug" },
      { name: "districts", indexName: "unique_district_slug" },
      { name: "categories", indexName: "unique_category_slug" },
      { name: "events", indexName: "unique_event_slug" },
      { name: "guides", indexName: "unique_guide_slug" },
    ];

    for (const collection of slugCollections) {
      await db.collection(collection.name).createIndex(
        { slug: 1 },
        {
          unique: true,
          name: collection.indexName,
        }
      );

      console.log(`✓ ${collection.name}: unique slug index ready`);
    }

    // 2. Places filtering indexes
    await db.collection("places").createIndex(
      { districtSlug: 1, status: 1 },
      { name: "places_district_status" }
    );

    await db.collection("places").createIndex(
      { category: 1, status: 1 },
      { name: "places_category_status" }
    );

    await db.collection("places").createIndex(
      { isFeatured: 1, status: 1 },
      { name: "places_featured_status" }
    );

    console.log("✓ Places filtering indexes ready");

    // 3. Admin session index
    await db.collection("admin_sessions").createIndex(
      { tokenHash: 1 },
      {
        unique: true,
        name: "unique_session_token_hash",
      }
    );

    console.log("✓ Admin session index ready");

    console.log("\nAll indexes created successfully!");
  } catch (error) {
    console.error("\nIndex creation failed:", error);

    if (error.code === 11000) {
      console.error(
        "Duplicate values found. Resolve duplicates before creating unique indexes."
      );
    }

    process.exitCode = 1;
  } finally {
    process.exit(process.exitCode || 0);
  }
}

createIndexes();
