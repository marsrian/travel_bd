
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const db = await connectDB();

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim();

    const filter = {
      status: "published",
    };

    if (q) {
      filter.$or = [
        {
          "name.en": {
            $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        },
        {
          "name.bn": {
            $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        },
      ];
    }

    const districts = await db
      .collection("districts")
      .find(filter)
      .sort({ "name.en": 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: districts.map((district) => ({
        ...district,
        _id: district._id.toString(),
      })),
    });

  } catch (error) {
    console.error("District API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch districts.",
      },
      { status: 500 }
    );
  }
}
