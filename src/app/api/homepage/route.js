import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await connectDB();

    const now = new Date();

    const [places, districts, events, guides] = await Promise.all([
      db
        .collection("places")
        .find({
          status: "published",
          isFeatured: true,
        })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray(),

      db
        .collection("districts")
        .find({
          status: "published",
          isFeatured: true,
        })
        .limit(8)
        .toArray(),

      db
        .collection("events")
        .find({
          status: "published",
          startsAt: { $gte: now },
        })
        .sort({ startsAt: 1 })
        .limit(5)
        .toArray(),

      db
        .collection("guides")
        .find({
          status: "published",
        })
        .sort({ publishedAt: -1 })
        .limit(5)
        .toArray(),
    ]);

    // Convert MongoDB ObjectIds into strings.
    const serialize = (items) =>
      items.map((item) => ({
        ...item,
        _id: item._id.toString(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        places: serialize(places),
        districts: serialize(districts),
        events: serialize(events),
        guides: serialize(guides),
      },
    });
  } catch (error) {
    console.error("HOMEPAGE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load homepage data.",
      },
      { status: 500 },
    );
  }
}
