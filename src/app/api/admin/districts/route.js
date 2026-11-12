
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeDistrict(district) {
  return {
    ...district,
    _id: district._id.toString(),
  };
}

// GET: Get all districts
export async function GET(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const division = searchParams.get("division") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );

    const filter = {};

    if (q) {
      const searchRegex = new RegExp(escapeRegex(q), "i");

      filter.$or = [
        { "name.en": searchRegex },
        { "name.bn": searchRegex },
        { slug: searchRegex },
        { division: searchRegex },
      ];
    }

    if (division) {
      filter.division = division;
    }

    const db = await connectDB();
    const collection = db.collection("districts");

    const total = await collection.countDocuments(filter);

    const districts = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      districts: districts.map(serializeDistrict),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET districts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch districts." },
      { status: 500 }
    );
  }
}

// POST: Create a district
export async function POST(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
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

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof body.name?.en !== "string" ||
      !body.name.en.trim() ||
      typeof body.name?.bn !== "string" ||
      !body.name.bn.trim() ||
      typeof body.division !== "string" ||
      !body.division.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "English name, Bengali name and division are required.",
        },
        { status: 400 }
      );
    }

    const slug = slugify(body.slug || body.name.en);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid English slug is required." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("districts");

    const existingDistrict = await collection.findOne({ slug });

    if (existingDistrict) {
      return NextResponse.json(
        { success: false, message: "A district with this slug already exists." },
        { status: 409 }
      );
    }

    const district = {
      slug,
      name: {
        en: body.name.en.trim(),
        bn: body.name.bn.trim(),
      },
      division: body.division.trim(),
      summary: body.summary || { en: "", bn: "" },
      history: body.history || { en: "", bn: "" },
      famousFor: body.famousFor || { en: "", bn: "" },
      transportation: body.transportation || { en: "", bn: "" },
      coverImage: body.coverImage || "",
      location: body.location || {},
      isFeatured: body.isFeatured === true,
      status: body.status === "draft" ? "draft" : "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(district);

    return NextResponse.json(
      {
        success: true,
        message: "District created successfully.",
        district: serializeDistrict({
          ...district,
          _id: result.insertedId,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST district error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "District slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create district." },
      { status: 500 }
    );
  }
}
