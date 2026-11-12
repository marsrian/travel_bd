
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

// export const runtime = "nodejs";

const allowedResourceTypes = ["image"];

export async function GET(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );

    const db = await connectDB();
    const collection = db.collection("media");

    const [media, total] = await Promise.all([
      collection
        .find({ resourceType: "image" })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),

      collection.countDocuments({ resourceType: "image" }),
    ]);

    return NextResponse.json({
      success: true,
      media: media.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET media error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const publicId =
      typeof body.publicId === "string" ? body.publicId.trim() : "";

    const secureUrl =
      typeof body.secureUrl === "string" ? body.secureUrl.trim() : "";

    const format =
      typeof body.format === "string" ? body.format.trim() : "";

    const resourceType =
      typeof body.resourceType === "string"
        ? body.resourceType.trim()
        : "image";

    const width = Number(body.width);
    const height = Number(body.height);
    const bytes = Number(body.bytes);

    if (
      !publicId ||
      !secureUrl ||
      !format ||
      resourceType !== "image" ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      !Number.isFinite(bytes) ||
      width <= 0 ||
      height <= 0 ||
      bytes <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid media information" },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    let imageUrl;

    try {
      imageUrl = new URL(secureUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid image URL" },
        { status: 400 }
      );
    }

    if (
      imageUrl.protocol !== "https:" ||
      imageUrl.hostname !== "res.cloudinary.com" ||
      !imageUrl.pathname.startsWith(`/${cloudName}/image/upload/`) ||
      !publicId.startsWith("bangladesh-tourism/")
    ) {
      return NextResponse.json(
        { success: false, message: "Untrusted media source" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("media");

    const existing = await collection.findOne({ publicId });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Media already registered" },
        { status: 409 }
      );
    }

    const media = {
      publicId,
      secureUrl: imageUrl.toString(),
      format,
      resourceType,
      width,
      height,
      bytes,
      createdAt: new Date(),
      uploadedBy: admin.id,
    };

    const result = await collection.insertOne(media);

    return NextResponse.json(
      {
        success: true,
        message: "Media registered successfully",
        media: {
          ...media,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST media error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to register media" },
      { status: 500 }
    );
  }
}
