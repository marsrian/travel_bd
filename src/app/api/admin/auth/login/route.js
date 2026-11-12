
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { createAdminSession } from "@/lib/admin-auth";

// export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password ||
      email.length > 254 ||
      password.length > 128
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const admin = await db.collection("admins").findOne({
      email,
      role: "admin",
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createAdminSession(admin);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to process login." },
      { status: 500 }
    );
  }
}
