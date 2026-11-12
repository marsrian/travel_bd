
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serializeEvent(event) {
  if (!event) return null;

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

// GET: Single event
export async function GET(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const event = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: serializeEvent(event),
    });
  } catch (error) {
    console.error("GET single event error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

// PATCH: Update event
export async function PATCH(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
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
    const collection = db.collection("events");
    const eventId = new ObjectId(id);

    const existingEvent = await collection.findOne({ _id: eventId });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    const allowedFields = [
      "title",
      "description",
      "districtSlug",
      "location",
      "startsAt",
      "endsAt",
      "coverImage",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.hasOwn(body, "title")) {
      if (
        !validBilingual(body.title) ||
        !body.title.en.trim() ||
        !body.title.bn.trim()
      ) {
        return NextResponse.json(
          { success: false, message: "Both event titles are required." },
          { status: 400 }
        );
      }

      updates.title = {
        en: body.title.en.trim(),
        bn: body.title.bn.trim(),
      };

      if (!Object.hasOwn(body, "slug")) {
        updates.slug = slugify(body.title.en);
      }
    }

    if (Object.hasOwn(body, "description")) {
      if (!validBilingual(body.description)) {
        return NextResponse.json(
          { success: false, message: "Invalid bilingual description." },
          { status: 400 }
        );
      }

      updates.description = {
        en: body.description.en.trim(),
        bn: body.description.bn.trim(),
      };
    }

    if (Object.hasOwn(body, "location")) {
      if (!validBilingual(body.location)) {
        return NextResponse.json(
          { success: false, message: "Invalid bilingual location." },
          { status: 400 }
        );
      }

      updates.location = {
        en: body.location.en.trim(),
        bn: body.location.bn.trim(),
      };
    }

    if (Object.hasOwn(body, "districtSlug")) {
      if (typeof body.districtSlug !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid district slug." },
          { status: 400 }
        );
      }

      updates.districtSlug = body.districtSlug.trim();
    }

    if (Object.hasOwn(body, "status")) {
      if (!["draft", "published"].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid event status." },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (Object.hasOwn(body, "coverImage")) {
      if (typeof body.coverImage !== "string") {
        return NextResponse.json(
          { success: false, message: "Invalid cover image." },
          { status: 400 }
        );
      }

      updates.coverImage = body.coverImage.trim();
    }

    if (Object.hasOwn(body, "slug")) {
      if (typeof body.slug !== "string" || !slugify(body.slug)) {
        return NextResponse.json(
          { success: false, message: "Invalid event slug." },
          { status: 400 }
        );
      }

      updates.slug = slugify(body.slug);
    }

    if (Object.hasOwn(body, "startsAt")) {
      const date = new Date(body.startsAt);

      if (!body.startsAt || Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid event start date." },
          { status: 400 }
        );
      }

      updates.startsAt = date;
    }

    if (Object.hasOwn(body, "endsAt")) {
      const date = new Date(body.endsAt);

      if (!body.endsAt || Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid event end date." },
          { status: 400 }
        );
      }

      updates.endsAt = date;
    }

    const finalStart = updates.startsAt || existingEvent.startsAt;
    const finalEnd = updates.endsAt || existingEvent.endsAt;

    if (
      !(finalStart instanceof Date) ||
      !(finalEnd instanceof Date) ||
      Number.isNaN(finalStart.getTime()) ||
      Number.isNaN(finalEnd.getTime()) ||
      finalEnd <= finalStart
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Event end date must be after start date.",
        },
        { status: 400 }
      );
    }

    if (updates.districtSlug) {
      const district = await db.collection("districts").findOne({
        slug: updates.districtSlug,
      });

      if (!district) {
        return NextResponse.json(
          { success: false, message: "Selected district does not exist." },
          { status: 400 }
        );
      }
    }

    if (updates.slug) {
      const duplicate = await collection.findOne({
        slug: updates.slug,
        _id: { $ne: eventId },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "This event slug is already in use." },
          { status: 409 }
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided." },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date();

    await collection.updateOne(
      { _id: eventId },
      { $set: updates }
    );

    const updatedEvent = await collection.findOne({ _id: eventId });

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: serializeEvent(updatedEvent),
    });
  } catch (error) {
    console.error("PATCH event error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update event." },
      { status: 500 }
    );
  }
}

// DELETE: Delete event
export async function DELETE(request, context) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID." },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE event error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete event." },
      { status: 500 }
    );
  }
}
