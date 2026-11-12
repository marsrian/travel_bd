
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

function slugify(value = "") {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serializeDistrict(district) {
  if (!district) return null;

  return {
    ...district,
    _id: district._id.toString(),
  };
}

async function getParams(context) {
  return await context.params;
}

// GET: Get single district
export async function GET(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await getParams(context);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid district ID." },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const district = await db.collection("districts").findOne({
      _id: new ObjectId(id),
    });

    if (!district) {
      return NextResponse.json(
        { success: false, message: "District not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      district: serializeDistrict(district),
    });
  } catch (error) {
    console.error("GET single district error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch district." },
      { status: 500 }
    );
  }
}

// PATCH: Update district
export async function PATCH(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await getParams(context);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid district ID." },
        { status: 400 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("districts");
    const placesCollection = db.collection("places");
    const districtId = new ObjectId(id);

    const existingDistrict = await collection.findOne({
      _id: districtId,
    });

    if (!existingDistrict) {
      return NextResponse.json(
        { success: false, message: "District not found." },
        { status: 404 }
      );
    }

    const allowedFields = [
      "name",
      "division",
      "summary",
      "history",
      "famousFor",
      "transportation",
      "coverImage",
      "location",
      "isFeatured",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(body, field)) {
        updates[field] = body[field];
      }
    }

    // Validate bilingual district name
    if (Object.hasOwn(body, "name")) {
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
            message: "Both English and Bengali district names are required.",
          },
          { status: 400 }
        );
      }

      updates.name = {
        en: body.name.en.trim(),
        bn: body.name.bn.trim(),
      };

      // Generate slug if English name changes
      if (!Object.hasOwn(body, "slug")) {
        updates.slug = slugify(body.name.en);
      }
    }

    // Validate custom slug
    if (Object.hasOwn(body, "slug")) {
      if (typeof body.slug !== "string" || !slugify(body.slug)) {
        return NextResponse.json(
          { success: false, message: "Invalid slug." },
          { status: 400 }
        );
      }

      updates.slug = slugify(body.slug);
    }

    if (Object.hasOwn(body, "division")) {
      if (
        typeof body.division !== "string" ||
        !body.division.trim() ||
        body.division.trim().length > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Division must be a valid string." },
          { status: 400 }
        );
      }

      updates.division = body.division.trim();
    }

    if (
      Object.hasOwn(body, "isFeatured") &&
      typeof body.isFeatured !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "isFeatured must be true or false." },
        { status: 400 }
      );
    }

    if (
      Object.hasOwn(body, "status") &&
      !["published", "draft"].includes(body.status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid district status." },
        { status: 400 }
      );
    }

    // Check duplicate slug
    if (updates.slug) {
      const duplicate = await collection.findOne({
        slug: updates.slug,
        _id: { $ne: districtId },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "This slug is already in use." },
          { status: 409 }
        );
      }
    }

    // Prevent slug change when places are using this district
    if (
      updates.slug &&
      updates.slug !== existingDistrict.slug
    ) {
      const relatedPlaces = await placesCollection.countDocuments({
        districtSlug: existingDistrict.slug,
      });

      if (relatedPlaces > 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cannot change this district slug because existing places are using it. Update or migrate related places first.",
            relatedPlaces,
          },
          { status: 409 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date();

    await collection.updateOne(
      { _id: districtId },
      { $set: updates }
    );

    const updatedDistrict = await collection.findOne({
      _id: districtId,
    });

    return NextResponse.json({
      success: true,
      message: "District updated successfully.",
      district: serializeDistrict(updatedDistrict),
    });
  } catch (error) {
    console.error("PATCH district error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "This district slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update district." },
      { status: 500 }
    );
  }
}

// DELETE: Delete district
export async function DELETE(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await getParams(context);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid district ID." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const districtId = new ObjectId(id);

    const district = await db.collection("districts").findOne({
      _id: districtId,
    });

    if (!district) {
      return NextResponse.json(
        { success: false, message: "District not found." },
        { status: 404 }
      );
    }

    const relatedPlaces = await db.collection("places").countDocuments({
      districtSlug: district.slug,
    });

    if (relatedPlaces > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete this district because it has related places.",
          relatedPlaces,
        },
        { status: 409 }
      );
    }

    await db.collection("districts").deleteOne({
      _id: districtId,
    });

    return NextResponse.json({
      success: true,
      message: "District deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE district error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete district." },
      { status: 500 }
    );
  }
}
