
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";

// export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid media ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("media");

    const media = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!media) {
      return NextResponse.json(
        { success: false, message: "Media not found" },
        { status: 404 }
      );
    }

    const usedBy = await Promise.all([
      db.collection("places").countDocuments({
        $or: [
          { coverImage: media.secureUrl },
          { images: media.secureUrl },
          { images: { $elemMatch: { url: media.secureUrl } } },
        ],
      }),

      db.collection("districts").countDocuments({
        coverImage: media.secureUrl,
      }),

      db.collection("events").countDocuments({
        coverImage: media.secureUrl,
      }),

      db.collection("guides").countDocuments({
        coverImage: media.secureUrl,
      }),

      db.collection("categories").countDocuments({
        coverImage: media.secureUrl,
      }),
    ]);

    const referenceCount = usedBy.reduce(
      (total, count) => total + count,
      0
    );

    if (referenceCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This image is currently in use. Replace it before deleting.",
          referenceCount,
        },
        { status: 409 }
      );
    }

    const result = await cloudinary.uploader.destroy(media.publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { success: false, message: "Cloudinary could not delete this image" },
        { status: 502 }
      );
    }

    await collection.deleteOne({ _id: media._id });

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("DELETE media error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete media" },
      { status: 500 }
    );
  }
}
