
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

// export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const db = await connectDB();

    const place = await db.collection("places").findOne({
      slug,
      status: "published",
    });

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Tourist place not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...place,
        _id: place._id.toString(),
      },
    });

  } catch (error) {
    console.error("Single place API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tourist place.",
      },
      { status: 500 }
    );
  }
}
