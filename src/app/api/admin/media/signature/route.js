
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

import { getCurrentAdmin } from "@/lib/admin-auth";

// export const runtime = "nodejs";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: "Cloudinary is not configured" },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "bangladesh-tourism";

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signatureString =
      Object.keys(paramsToSign)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join("&") + apiSecret;

    const signature = createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      folder,
      apiKey,
      cloudName,
    });
  } catch (error) {
    console.error("Media signature error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
