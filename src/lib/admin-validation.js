
// src/lib/admin-validation.js

// Check whether a value is a plain object
export function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

// Escape special regex characters before using search input
export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Create URL-friendly English slug
export function createSlug(value = "") {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Validate and normalize a string
export function validateString(
  value,
  fieldName,
  {
    required = false,
    maxLength = 500,
    minLength = 0,
  } = {}
) {
  if (typeof value !== "string") {
    if (required) {
      return {
        value: "",
        error: `${fieldName} must be a string`,
      };
    }

    if (value === undefined || value === null) {
      return { value: "", error: null };
    }

    return {
      value: "",
      error: `${fieldName} must be a string`,
    };
  }

  const normalized = value.trim();

  if (required && !normalized) {
    return {
      value: "",
      error: `${fieldName} is required`,
    };
  }

  if (normalized.length < minLength) {
    return {
      value: normalized,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (normalized.length > maxLength) {
    return {
      value: normalized,
      error: `${fieldName} cannot exceed ${maxLength} characters`,
    };
  }

  return { value: normalized, error: null };
}

// Validate bilingual objects such as title, name and description
export function validateBilingual(
  value,
  fieldName,
  {
    required = true,
    maxLength = 500,
    minLength = 0,
  } = {}
) {
  if (!isPlainObject(value)) {
    return {
      value: { en: "", bn: "" },
      error: `${fieldName} must contain English and Bengali values`,
    };
  }

  const en = validateString(value.en, `${fieldName}.en`, {
    required,
    maxLength,
    minLength,
  });

  if (en.error) {
    return { value: null, error: en.error };
  }

  const bn = validateString(value.bn, `${fieldName}.bn`, {
    required,
    maxLength,
    minLength,
  });

  if (bn.error) {
    return { value: null, error: bn.error };
  }

  return {
    value: {
      en: en.value,
      bn: bn.value,
    },
    error: null,
  };
}

// Validate optional HTTP/HTTPS image URLs
export function validateImageUrl(value, fieldName = "Image URL") {
  const result = validateString(value, fieldName, {
    required: false,
    maxLength: 2048,
  });

  if (result.error) return result;
  if (!result.value) return result;

  try {
    const url = new URL(result.value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        value: "",
        error: `${fieldName} must use HTTP or HTTPS`,
      };
    }

    return result;
  } catch {
    return {
      value: "",
      error: `${fieldName} is not a valid URL`,
    };
  }
}

// Validate boolean values without converting strings like "false" to true
export function validateBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    return {
      value: null,
      error: `${fieldName} must be true or false`,
    };
  }

  return { value, error: null };
}

// Validate dates
export function validateDate(value, fieldName = "Date") {
  const date = value instanceof Date ? value : new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return {
      value: null,
      error: `${fieldName} is invalid`,
    };
  }

  return { value: date, error: null };
}

// Validate pagination query parameters
export function getPagination(searchParams) {
  const rawPage = Number(searchParams.get("page") || 1);
  const rawLimit = Number(searchParams.get("limit") || 10);

  const page = Number.isFinite(rawPage)
    ? Math.max(1, Math.floor(rawPage))
    : 1;

  const limit = Number.isFinite(rawLimit)
    ? Math.min(100, Math.max(1, Math.floor(rawLimit)))
    : 10;

  return { page, limit };
}

// Safely parse request JSON
export async function readJsonBody(request) {
  try {
    const data = await request.json();

    if (!isPlainObject(data)) {
      return {
        data: null,
        error: "Request body must be a JSON object",
      };
    }

    return { data, error: null };
  } catch {
    return {
      data: null,
      error: "Invalid JSON request body",
    };
  }
}
