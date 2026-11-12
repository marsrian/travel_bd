import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "District slug is required.",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const district = await db.collection("districts").findOne({
      slug,
      status: "published",
    });

    if (!district) {
      return NextResponse.json(
        {
          success: false,
          message: "District not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...district,
        _id: district._id.toString(),
      },
    });
  } catch (error) {
    console.error("DISTRICT DETAIL API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load district.",
      },
      { status: 500 }
    );
  }
}