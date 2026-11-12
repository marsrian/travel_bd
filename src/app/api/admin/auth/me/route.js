
import { connection } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";

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

    return Response.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Admin session verification error:", error);

    return Response.json(
      { message: "Session verification failed." },
      { status: 500 }
    );
  }
}
