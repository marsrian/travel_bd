import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  createSlug,
  escapeRegex,
  getPagination,
  isPlainObject,
  readJsonBody,
  validateBilingual,
  validateBoolean,
  validateImageUrl,
  validateString,
} from "@/lib/admin-validation";

function serializePlace(place) {
  return {
    ...place,
    _id: place._id.toString(),
  };
}

function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function validateOptionalBilingual(value, fieldName, maxLength = 5000) {
  if (value === undefined) {
    return {
      value: { en: "", bn: "" },
      error: null,
    };
  }

  return validateBilingual(value, fieldName, {
    required: false,
    maxLength,
  });
}

function validateObject(value, fieldName) {
  if (value === undefined) {
    return { value: {}, error: null };
  }

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
    const result = validateImageUrl(value[index], `images[${index}]`);

    if (result.error) {
      return {
        value: null,
        error: result.error,
      };
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
    return {
      error: "Selected district does not exist.",
    };
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

  return {
    district,
    category,
    error: null,
  };
}

// GET: Admin places list
export async function GET(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return errorResponse("Unauthorized access.", 401);
    }

    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const district = searchParams.get("district") || "";
    const category = searchParams.get("category") || "";

    const { page, limit } = getPagination(searchParams);

    const filter = {};

    if (district) filter.districtSlug = district;
    if (category) filter.category = category;

    if (q) {
      const searchRegex = new RegExp(escapeRegex(q), "i");

      filter.$or = [
        { "name.en": searchRegex },
        { "name.bn": searchRegex },
        { slug: searchRegex },
        { districtSlug: searchRegex },
      ];
    }

    const db = await connectDB();
    const collection = db.collection("places");

    const [places, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ updatedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      places: places.map(serializePlace),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin places GET error:", error);

    return errorResponse("Failed to load places.", 500);
  }
}

// POST: Create a new place
export async function POST(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return errorResponse("Unauthorized access.", 401);
    }

    const { data: body, error: bodyError } = await readJsonBody(request);

    if (bodyError) {
      return errorResponse(bodyError);
    }

    const nameResult = validateBilingual(body.name, "name", {
      required: false,
      maxLength: 150,
    });

    if (nameResult.error) {
      return errorResponse(nameResult.error);
    }

    if (!nameResult.value.en) {
      return errorResponse("English place name is required.");
    }

    if (nameResult.error) {
      return errorResponse(nameResult.error);
    }

    if (!nameResult.value.en) {
      return errorResponse("English place name is required.");
    }

    const districtResult = validateString(body.districtSlug, "districtSlug", {
      required: true,
      maxLength: 150,
    });

    if (districtResult.error) {
      return errorResponse(districtResult.error);
    }

    const categoryResult = validateString(body.category, "category", {
      required: true,
      maxLength: 100,
    });

    if (categoryResult.error) {
      return errorResponse(categoryResult.error);
    }

    const slugInput =
      body.slug === undefined || body.slug === ""
        ? nameResult.value.en
        : body.slug;

    const slugString = validateString(slugInput, "slug", {
      required: true,
      maxLength: 180,
    });

    if (slugString.error) {
      return errorResponse(slugString.error);
    }

    const slug = createSlug(slugString.value);

    if (!slug) {
      return errorResponse("A valid English slug is required.");
    }

    const summary = validateOptionalBilingual(body.summary, "summary", 5000);

    const history = validateOptionalBilingual(body.history, "history", 20000);

    const transportation = validateOptionalBilingual(
      body.transportation,
      "transportation",
      10000,
    );

    const bestVisitingTime = validateOptionalBilingual(
      body.bestVisitingTime,
      "bestVisitingTime",
      2000,
    );

    for (const result of [summary, history, transportation, bestVisitingTime]) {
      if (result.error) return errorResponse(result.error);
    }

    const visitingInfo = validateObject(body.visitingInfo, "visitingInfo");

    const location = validateObject(body.location, "location");

    if (visitingInfo.error) {
      return errorResponse(visitingInfo.error);
    }

    if (location.error) {
      return errorResponse(location.error);
    }

    const coverImage = validateImageUrl(body.coverImage ?? "", "coverImage");

    if (coverImage.error) {
      return errorResponse(coverImage.error);
    }

    const images =
      body.images === undefined
        ? { value: [], error: null }
        : validateImages(body.images);

    if (images.error) {
      return errorResponse(images.error);
    }

    const featured =
      body.isFeatured === undefined
        ? { value: false, error: null }
        : validateBoolean(body.isFeatured, "isFeatured");

    if (featured.error) {
      return errorResponse(featured.error);
    }

    const status = body.status ?? "draft";

    if (!["draft", "published"].includes(status)) {
      return errorResponse("Invalid place status.");
    }

    const db = await connectDB();
    const collection = db.collection("places");

    const references = await validateReferences(
      db,
      districtResult.value,
      categoryResult.value,
    );

    if (references.error) {
      return errorResponse(references.error, 400);
    }

    const existingPlace = await collection.findOne({ slug });

    if (existingPlace) {
      return errorResponse("This place slug already exists.", 409);
    }

    const now = new Date();

    const newPlace = {
      slug,
      name: nameResult.value,
      districtSlug: districtResult.value,
      districtName: references.district.name || {
        en: "",
        bn: "",
      },
      category: categoryResult.value,
      summary: summary.value,
      history: history.value,
      visitingInfo: visitingInfo.value,
      location: location.value,
      transportation: transportation.value,
      bestVisitingTime: bestVisitingTime.value,
      coverImage: coverImage.value,
      images: images.value,
      isFeatured: featured.value,
      status,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newPlace);

    return NextResponse.json(
      {
        success: true,
        message: "Place created successfully.",
        place: {
          ...newPlace,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin places POST error:", error);

    if (error.code === 11000) {
      return errorResponse("This place slug already exists.", 409);
    }

    return errorResponse("Failed to create place.", 500);
  }
}
