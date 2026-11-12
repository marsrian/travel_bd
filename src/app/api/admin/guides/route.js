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
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );

    const db = await connectDB();
    const collection = db.collection("guides");

    const filter = {};

    if (q) {
      filter.$or = [
        { "title.en": { $regex: q, $options: "i" } },
        { "title.bn": { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
      ];
    }

    if (["draft", "published"].includes(status)) {
      filter.status = status;
    }

    const [guides, total] = await Promise.all([
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
      guides: guides.map((guide) => ({
        ...guide,
        _id: guide._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET guides error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch guides" },
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

    const title = {
      en: body.title?.en?.trim() || "",
      bn: body.title?.bn?.trim() || "",
    };

    const description = {
      en: body.description?.en?.trim() || "",
      bn: body.description?.bn?.trim() || "",
    };

    const content = {
      en: body.content?.en || "",
      bn: body.content?.bn || "",
    };

    if (!title.en || !title.bn || !content.en.trim() || !content.bn.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "English and Bengali titles and article contents are required",
        },
        { status: 400 }
      );
    }

    const status = body.status || "draft";

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid guide status" },
        { status: 400 }
      );
    }

    const slug = createSlug(body.slug || title.en);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid English slug is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("guides");

    const existingGuide = await collection.findOne({ slug });

    if (existingGuide) {
      return NextResponse.json(
        { success: false, message: "A guide with this slug already exists" },
        { status: 409 }
      );
    }

    const now = new Date();

    const guide = {
      title,
      slug,
      description,
      content,
      coverImage: body.coverImage?.trim() || "",
      publishedAt:
        status === "published"
          ? body.publishedAt
            ? new Date(body.publishedAt)
            : now
          : null,
      status,
      createdAt: now,
      updatedAt: now,
    };

    if (
      guide.publishedAt &&
      Number.isNaN(guide.publishedAt.getTime())
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid publishedAt date" },
        { status: 400 }
      );
    }

    const result = await collection.insertOne(guide);

    return NextResponse.json(
      {
        success: true,
        message: "Guide created successfully",
        guide: {
          ...guide,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST guide error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create guide" },
      { status: 500 }
    );
  }
}