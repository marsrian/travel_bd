
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

function createSlug(value = "") {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function serializeCategory(category) {
  if (!category) return null;

  return {
    ...category,
    _id: category._id.toString(),
  };
}

// GET: Get single category
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
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const category = await db.collection("categories").findOne({
      _id: new ObjectId(id),
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error("GET category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PATCH: Update category
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
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("categories");
    const placesCollection = db.collection("places");
    const objectId = new ObjectId(id);

    const existing = await collection.findOne({
      _id: objectId,
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    // Validate category name
    if (body.name !== undefined) {
      if (
        !body.name ||
        typeof body.name !== "object" ||
        Array.isArray(body.name) ||
        typeof body.name.en !== "string" ||
        !body.name.en.trim() ||
        typeof body.name.bn !== "string" ||
        !body.name.bn.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Both English and Bengali category names are required",
          },
          { status: 400 }
        );
      }

      updateData.name = {
        en: body.name.en.trim(),
        bn: body.name.bn.trim(),
      };
    }

    // Validate description
    if (body.description !== undefined) {
      if (
        !body.description ||
        typeof body.description !== "object" ||
        Array.isArray(body.description) ||
        typeof body.description.en !== "string" ||
        typeof body.description.bn !== "string"
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid category description" },
          { status: 400 }
        );
      }

      updateData.description = {
        en: body.description.en.trim(),
        bn: body.description.bn.trim(),
      };
    }

    // Generate or validate slug
    if (body.slug !== undefined || body.name?.en !== undefined) {
      const slugSource =
        body.slug !== undefined
          ? body.slug
          : updateData.name?.en || existing.name.en;

      if (typeof slugSource !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid category slug" },
          { status: 400 }
        );
      }

      const slug = createSlug(slugSource);

      if (!slug) {
        return NextResponse.json(
          { success: false, message: "Invalid category slug" },
          { status: 400 }
        );
      }

      const duplicate = await collection.findOne({
        slug,
        _id: { $ne: objectId },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Category slug already exists" },
          { status: 409 }
        );
      }

      // Prevent slug change when places are using this category
      if (slug !== existing.slug) {
        const relatedPlaces = await placesCollection.countDocuments({
          category: existing.slug,
        });

        if (relatedPlaces > 0) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Cannot change this category slug because existing places are using it. Update or migrate related places first.",
              relatedPlaces,
            },
            { status: 409 }
          );
        }
      }

      updateData.slug = slug;
    }

    // Validate icon
    if (body.icon !== undefined) {
      if (typeof body.icon !== "string" || body.icon.length > 100) {
        return NextResponse.json(
          { success: false, message: "Invalid category icon" },
          { status: 400 }
        );
      }

      updateData.icon = body.icon.trim();
    }

    // Validate cover image
    if (body.coverImage !== undefined) {
      if (
        typeof body.coverImage !== "string" ||
        body.coverImage.length > 2048
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid cover image URL" },
          { status: 400 }
        );
      }

      updateData.coverImage = body.coverImage.trim();
    }

    // Validate status
    if (body.status !== undefined) {
      if (!["active", "inactive"].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid category status" },
          { status: 400 }
        );
      }

      updateData.status = body.status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    const updated = await collection.findOne({
      _id: objectId,
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: serializeCategory(updated),
    });
  } catch (error) {
    console.error("PATCH category error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Category slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE: Delete category
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
        { success: false, message: "Invalid category ID" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const objectId = new ObjectId(id);

    const category = await db.collection("categories").findOne({
      _id: objectId,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const relatedPlaces = await db.collection("places").countDocuments({
      category: category.slug,
    });

    if (relatedPlaces > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category is used by existing places. Deactivate it instead.",
          relatedPlaces,
        },
        { status: 409 }
      );
    }

    await db.collection("categories").deleteOne({
      _id: objectId,
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
