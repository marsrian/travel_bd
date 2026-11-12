
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

function serializeEvent(event) {
  return {
    ...event,
    _id: event._id.toString(),
  };
}

function validBilingual(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.en === "string" &&
    typeof value.bn === "string"
  );
}

// GET: List events
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
    const status = searchParams.get("status") || "";
    const districtSlug = searchParams.get("district") || "";

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page"), 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit"), 10) || 10)
    );

    const filter = {};

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");

      filter.$or = [
        { "title.en": regex },
        { "title.bn": regex },
        { slug: regex },
        { "location.en": regex },
        { "location.bn": regex },
      ];
    }

    if (status) {
      if (!["draft", "published"].includes(status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status filter." },
          { status: 400 }
        );
      }

      filter.status = status;
    }

    if (districtSlug) {
      filter.districtSlug = districtSlug;
    }

    const db = await connectDB();
    const collection = db.collection("events");

    const total = await collection.countDocuments(filter);

    const events = await collection
      .find(filter)
      .sort({ startsAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      events: events.map(serializeEvent),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET events error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch events." },
      { status: 500 }
    );
  }
}

// POST: Create event
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
      !validBilingual(body.title) ||
      !body.title.en.trim() ||
      !body.title.bn.trim() ||
      !validBilingual(body.description) ||
      !validBilingual(body.location)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid bilingual title, description and location are required.",
        },
        { status: 400 }
      );
    }

    const slug = slugify(body.slug || body.title.en);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid English slug is required." },
        { status: 400 }
      );
    }

    if (
      body.districtSlug !== undefined &&
      typeof body.districtSlug !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid district slug." },
        { status: 400 }
      );
    }

    if (
      !["draft", "published"].includes(body.status || "draft")
    ) {
      return NextResponse.json(
        { success: false, message: "Status must be draft or published." },
        { status: 400 }
      );
    }

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);

    if (
      !body.startsAt ||
      !body.endsAt ||
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid event dates are required. End date must be after start date.",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const events = db.collection("events");

    const existing = await events.findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "An event with this slug already exists." },
        { status: 409 }
      );
    }

    const districtSlug = body.districtSlug?.trim() || "";

    if (districtSlug) {
      const district = await db.collection("districts").findOne({
        slug: districtSlug,
      });

      if (!district) {
        return NextResponse.json(
          { success: false, message: "Selected district does not exist." },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    const event = {
      title: {
        en: body.title.en.trim(),
        bn: body.title.bn.trim(),
      },
      slug,
      description: {
        en: body.description.en.trim(),
        bn: body.description.bn.trim(),
      },
      districtSlug,
      location: {
        en: body.location.en.trim(),
        bn: body.location.bn.trim(),
      },
      startsAt,
      endsAt,
      coverImage:
        typeof body.coverImage === "string" ? body.coverImage.trim() : "",
      status: body.status || "draft",
      createdAt: now,
      updatedAt: now,
    };

    const result = await events.insertOne(event);

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        event: serializeEvent({
          ...event,
          _id: result.insertedId,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST event error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Event slug already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create event." },
      { status: 500 }
    );
  }
}
