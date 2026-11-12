
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// export const dynamic = "force-dynamic";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const db = await connectDB();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const district = searchParams.get("district") || "";
    const category = searchParams.get("category") || "";

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        parseInt(searchParams.get("limit") || "12", 10)
      )
    );

    const filter = {
      status: "published",
    };

    if (district) {
      filter.districtSlug = district;
    }

    if (category) {
      filter["category.slug"] = category;
    }

    if (q) {
      const searchRegex = new RegExp(
        escapeRegex(q),
        "i"
      );

      filter.$or = [
        { "name.en": searchRegex },
        { "name.bn": searchRegex },
        { "districtName.en": searchRegex },
        { "districtName.bn": searchRegex },
        { "category.en": searchRegex },
        { "category.bn": searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [places, total] = await Promise.all([
      db.collection("places")
        .find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),

      db.collection("places").countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: places.map((place) => ({
        ...place,
        _id: place._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Places API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tourist places.",
      },
      { status: 500 }
    );
  }
}
