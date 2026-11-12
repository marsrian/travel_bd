
import { connection } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  await connection();

  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await connectDB();

    const [places, districts, events, guides] = await Promise.all([
      db.collection("places").countDocuments(),
      db.collection("districts").countDocuments(),
      db.collection("events").countDocuments(),
      db.collection("guides").countDocuments(),
    ]);

    return Response.json({
      success: true,
      stats: {
        places,
        districts,
        events,
        guides,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return Response.json(
      { message: "Failed to load dashboard statistics." },
      { status: 500 }
    );
  }
}
