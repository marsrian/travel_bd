import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

function createSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request, { params }) {
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
        { success: false, message: "Invalid guide ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const guide = await db.collection("guides").findOne({
      _id: new ObjectId(id),
    });

    if (!guide) {
      return NextResponse.json(
        { success: false, message: "Guide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guide: {
        ...guide,
        _id: guide._id.toString(),
      },
    });
  } catch (error) {
    console.error("GET single guide error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch guide" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
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
        { success: false, message: "Invalid guide ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const db = await connectDB();
    const collection = db.collection("guides");
    const objectId = new ObjectId(id);

    const existingGuide = await collection.findOne({
      _id: objectId,
    });

    if (!existingGuide) {
      return NextResponse.json(
        { success: false, message: "Guide not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    if (body.title !== undefined) {
      updateData.title = {
        en: body.title?.en?.trim() || "",
        bn: body.title?.bn?.trim() || "",
      };

      if (!updateData.title.en || !updateData.title.bn) {
        return NextResponse.json(
          {
            success: false,
            message: "Both English and Bengali titles are required",
          },
          { status: 400 }
        );
      }
    }

    if (body.description !== undefined) {
      updateData.description = {
        en: body.description?.en?.trim() || "",
        bn: body.description?.bn?.trim() || "",
      };
    }

    if (body.content !== undefined) {
      updateData.content = {
        en: body.content?.en || "",
        bn: body.content?.bn || "",
      };

      if (
        !updateData.content.en.trim() ||
        !updateData.content.bn.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Both English and Bengali article contents are required",
          },
          { status: 400 }
        );
      }
    }

    if (body.slug !== undefined || body.title?.en !== undefined) {
      const slugSource =
        body.slug !== undefined
          ? body.slug
          : updateData.title?.en || existingGuide.title.en;

      const slug = createSlug(slugSource);

      if (!slug) {
        return NextResponse.json(
          { success: false, message: "Invalid slug" },
          { status: 400 }
        );
      }

      const duplicate = await collection.findOne({
        slug,
        _id: { $ne: objectId },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "This slug is already in use" },
          { status: 409 }
        );
      }

      updateData.slug = slug;
    }

    if (body.coverImage !== undefined) {
      updateData.coverImage = body.coverImage.trim();
    }

    if (body.status !== undefined) {
      if (!["draft", "published"].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid guide status" },
          { status: 400 }
        );
      }

      updateData.status = body.status;
    }

    const nextStatus = updateData.status || existingGuide.status;

    if (body.publishedAt !== undefined) {
      if (body.publishedAt === null || body.publishedAt === "") {
        updateData.publishedAt = null;
      } else {
        const publishedAt = new Date(body.publishedAt);

        if (Number.isNaN(publishedAt.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid publishedAt date" },
            { status: 400 }
          );
        }

        updateData.publishedAt = publishedAt;
      }
    } else if (
      nextStatus === "published" &&
      existingGuide.status !== "published"
    ) {
      updateData.publishedAt = new Date();
    } else if (nextStatus === "draft") {
      updateData.publishedAt = null;
    }

    updateData.updatedAt = new Date();

    await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    const updatedGuide = await collection.findOne({
      _id: objectId,
    });

    return NextResponse.json({
      success: true,
      message: "Guide updated successfully",
      guide: {
        ...updatedGuide,
        _id: updatedGuide._id.toString(),
      },
    });
  } catch (error) {
    console.error("PATCH guide error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update guide" },
      { status: 500 }
    );
  }
}

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
        { success: false, message: "Invalid guide ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const result = await db.collection("guides").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Guide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guide deleted successfully",
    });
  } catch (error) {
    console.error("DELETE guide error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete guide" },
      { status: 500 }
    );
  }
}