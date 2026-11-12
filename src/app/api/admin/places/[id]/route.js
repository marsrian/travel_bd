
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  createSlug,
  isPlainObject,
  readJsonBody,
  validateBilingual,
  validateBoolean,
  validateImageUrl,
  validateString,
} from "@/lib/admin-validation";

function isValidId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function serializePlace(place) {
  return {
    ...place,
    _id: place._id.toString(),
  };
}

function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function validateOptionalBilingual(value, fieldName, maxLength = 5000) {
  if (value === undefined) {
    return { value: null, error: null };
  }

  return validateBilingual(value, fieldName, {
    required: false,
    maxLength,
  });
}

function validateObject(value, fieldName) {
  if (!isPlainObject(value)) {
    return {
      value: null,
      error: `${fieldName} must be an object.`,
    };
  }

  return { value, error: null };
}

function validateImages(value) {
  if (!Array.isArray(value)) {
    return {
      value: null,
      error: "Images must be an array.",
    };
  }

  if (value.length > 30) {
    return {
      value: null,
      error: "You can add a maximum of 30 images.",
    };
  }

  const images = [];

  for (let index = 0; index < value.length; index++) {
    const result = validateImageUrl(
      value[index],
      `images[${index}]`
    );

    if (result.error) {
      return { value: null, error: result.error };
    }

    if (!result.value) {
      return {
        value: null,
        error: `Image ${index + 1} cannot be empty.`,
      };
    }

    images.push(result.value);
  }

  return { value: images, error: null };
}

async function validateReferences(db, districtSlug, categorySlug) {
  const district = await db.collection("districts").findOne({
    slug: districtSlug,
  });

  if (!district) {
    return { error: "Selected district does not exist." };
  }

  const category = await db.collection("categories").findOne({
    slug: categorySlug,
    status: "active",
  });

  if (!category) {
    return {
      error: "Selected category does not exist or is inactive.",
    };
  }

  return { district, category, error: null };
}

// GET: Get one place
export async function GET(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return errorResponse("Unauthorized access.", 401);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return errorResponse("Invalid place ID.");
    }

    const db = await connectDB();

    const place = await db.collection("places").findOne({
      _id: new ObjectId(id),
    });

    if (!place) {
      return errorResponse("Place not found.", 404);
    }

    return NextResponse.json({
      success: true,
      place: serializePlace(place),
    });
  } catch (error) {
    console.error("Admin place GET error:", error);

    return errorResponse("Failed to load place.", 500);
  }
}

// PATCH: Update one place
export async function PATCH(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return errorResponse("Unauthorized access.", 401);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return errorResponse("Invalid place ID.");
    }

    const { data: body, error: bodyError } = await readJsonBody(request);

    if (bodyError) {
      return errorResponse(bodyError);
    }

    const db = await connectDB();
    const collection = db.collection("places");
    const objectId = new ObjectId(id);

    const existingPlace = await collection.findOne({
      _id: objectId,
    });

    if (!existingPlace) {
      return errorResponse("Place not found.", 404);
    }

    const allowedFields = [
      "slug",
      "name",
      "districtSlug",
      "category",
      "summary",
      "history",
      "visitingInfo",
      "location",
      "transportation",
      "bestVisitingTime",
      "coverImage",
      "images",
      "isFeatured",
      "status",
    ];

    const hasAllowedField = allowedFields.some((field) =>
      Object.hasOwn(body, field)
    );

    if (!hasAllowedField) {
      return errorResponse("No valid fields provided.");
    }

    const updates = {};

    // Name
    if (body.name !== undefined) {
      const result = validateBilingual(body.name, "name", {
        required: false,
        maxLength: 150,
      });

      if (result.error) {
        return errorResponse(result.error);
      }

      if (!result.value.en) {
        return errorResponse("English place name is required.");
      }

      updates.name = result.value;
    }

    // Slug: automatically regenerate when English name changes
    if (body.slug !== undefined || updates.name) {
      const slugInput =
        body.slug !== undefined
          ? body.slug
          : updates.name.en;

      const slugResult = validateString(slugInput, "slug", {
        required: true,
        maxLength: 180,
      });

      if (slugResult.error) {
        return errorResponse(slugResult.error);
      }

      const slug = createSlug(slugResult.value);

      if (!slug) {
        return errorResponse("Invalid slug format.");
      }

      const duplicate = await collection.findOne({
        slug,
        _id: { $ne: objectId },
      });

      if (duplicate) {
        return errorResponse("This place slug already exists.", 409);
      }

      updates.slug = slug;
    }

    // District and category references
    const nextDistrictSlug =
      body.districtSlug !== undefined
        ? body.districtSlug
        : existingPlace.districtSlug;

    const nextCategory =
      body.category !== undefined
        ? body.category
        : existingPlace.category;

    if (body.districtSlug !== undefined) {
      const result = validateString(
        body.districtSlug,
        "districtSlug",
        { required: true, maxLength: 150 }
      );

      if (result.error) {
        return errorResponse(result.error);
      }

      updates.districtSlug = result.value;
    }

    if (body.category !== undefined) {
      const result = validateString(body.category, "category", {
        required: true,
        maxLength: 100,
      });

      if (result.error) {
        return errorResponse(result.error);
      }

      updates.category = result.value;
    }

    if (
      body.districtSlug !== undefined ||
      body.category !== undefined
    ) {
      const references = await validateReferences(
        db,
        nextDistrictSlug,
        nextCategory
      );

      if (references.error) {
        return errorResponse(references.error);
      }

      if (body.districtSlug !== undefined) {
        updates.districtName = references.district.name || {
          en: "",
          bn: "",
        };
      }
    }

    // Bilingual content fields
    const bilingualFields = {
      summary: 5000,
      history: 20000,
      transportation: 10000,
      bestVisitingTime: 2000,
    };

    for (const [field, maxLength] of Object.entries(bilingualFields)) {
      if (body[field] !== undefined) {
        const result = validateOptionalBilingual(
          body[field],
          field,
          maxLength
        );

        if (result.error) {
          return errorResponse(result.error);
        }

        updates[field] = result.value;
      }
    }

    // Object fields
    for (const field of ["visitingInfo", "location"]) {
      if (body[field] !== undefined) {
        const result = validateObject(body[field], field);

        if (result.error) {
          return errorResponse(result.error);
        }

        updates[field] = result.value;
      }
    }

    // Cover image
    if (body.coverImage !== undefined) {
      const result = validateImageUrl(body.coverImage, "coverImage");

      if (result.error) {
        return errorResponse(result.error);
      }

      updates.coverImage = result.value;
    }

    // Gallery images
    if (body.images !== undefined) {
      const result = validateImages(body.images);

      if (result.error) {
        return errorResponse(result.error);
      }

      updates.images = result.value;
    }

    // Featured flag
    if (body.isFeatured !== undefined) {
      const result = validateBoolean(body.isFeatured, "isFeatured");

      if (result.error) {
        return errorResponse(result.error);
      }

      updates.isFeatured = result.value;
    }

    // Status
    if (body.status !== undefined) {
      if (!["draft", "published"].includes(body.status)) {
        return errorResponse("Invalid place status.");
      }

      updates.status = body.status;
    }

    updates.updatedAt = new Date();

    await collection.updateOne(
      { _id: objectId },
      { $set: updates }
    );

    const updatedPlace = await collection.findOne({
      _id: objectId,
    });

    return NextResponse.json({
      success: true,
      message: "Place updated successfully.",
      place: serializePlace(updatedPlace),
    });
  } catch (error) {
    console.error("Admin place PATCH error:", error);

    if (error.code === 11000) {
      return errorResponse("This place slug already exists.", 409);
    }

    return errorResponse("Failed to update place.", 500);
  }
}

// DELETE: Delete one place
export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return errorResponse("Unauthorized access.", 401);
    }

    const { id } = await params;

    if (!isValidId(id)) {
      return errorResponse("Invalid place ID.");
    }

    const db = await connectDB();

    const result = await db.collection("places").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return errorResponse("Place not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Place deleted successfully.",
    });
  } catch (error) {
    console.error("Admin place DELETE error:", error);

    return errorResponse("Failed to delete place.", 500);
  }
}
