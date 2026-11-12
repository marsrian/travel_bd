
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

import { connectDB } from "@/lib/mongodb";

const COOKIE_NAME = "tourism_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Create a new admin session
export async function createAdminSession(admin) {
  const db = await connectDB();
  const sessions = db.collection("admin_sessions");

  await sessions.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  await sessions.createIndex({ adminId: 1 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await sessions.insertOne({
    adminId: admin._id,
    tokenHash: hashToken(token),
    createdAt: new Date(),
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Get the currently authenticated admin
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const db = await connectDB();

  // Get current time at request execution.
  const currentTime = new Date();

  const session = await db.collection("admin_sessions").findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: currentTime },
  });

  if (!session) return null;

  const admin = await db.collection("admins").findOne({
    _id: session.adminId,
    role: "admin",
    isActive: true,
  });

  if (!admin) return null;

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

// Delete the current admin session
export async function deleteAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const db = await connectDB();

    await db.collection("admin_sessions").deleteOne({
      tokenHash: hashToken(token),
    });
  }

  cookieStore.delete(COOKIE_NAME);
}
