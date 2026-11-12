import { NextResponse } from "next/server";
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

    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));

    const filter = {};

    if (q) {
      filter.$or = [
        { "name.en": { $regex: q, $options: "i" } },
        { "name.bn": { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
      ];
    }

    if (["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    const db = await connectDB();
    const collection = db.collection("categories");

    const [categories, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      categories: categories.map((category) => ({
        ...category,
        _id: category._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET categories error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
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

    const name = {
      en: body.name?.en?.trim() || "",
      bn: body.name?.bn?.trim() || "",
    };

    if (!name.en || !name.bn) {
      return NextResponse.json(
        {
          success: false,
          message: "English and Bengali category names are required",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(body.slug || name.en);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid English slug is required" },
        { status: 400 }
      );
    }

    const status = body.status || "active";

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid category status" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("categories");

    const existing = await collection.findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category slug already exists" },
        { status: 409 }
      );
    }

    const now = new Date();

    const category = {
      name,
      slug,
      description: {
        en: body.description?.en?.trim() || "",
        bn: body.description?.bn?.trim() || "",
      },
      icon: body.icon?.trim() || "",
      coverImage: body.coverImage?.trim() || "",
      status,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(category);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category: {
          ...category,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST category error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}