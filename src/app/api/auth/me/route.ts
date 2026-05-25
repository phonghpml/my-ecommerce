import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Lấy cookie token từ request headers
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // Verify token bằng jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.id as string;

    // Query database để lấy thêm name và role
    const result = await db.select().from(users).where(eq(users.id, userId));
    const user = result[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
