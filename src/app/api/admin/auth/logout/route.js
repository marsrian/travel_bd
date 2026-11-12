
import { NextResponse } from "next/server";

import { deleteAdminSession } from "@/lib/admin-auth";

// export const runtime = "nodejs";

export async function POST() {
  try {
    await deleteAdminSession();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to log out." },
      { status: 500 }
    );
  }
}
