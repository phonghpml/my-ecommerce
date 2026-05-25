import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs"; // dùng bcryptjs để tránh lỗi native

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Kiểm tra email đã tồn tại chưa
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user mới
    await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
      role: "user", // mặc định user
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Register error:", error);

    // Nếu lỗi duplicate key (Postgres code 23505)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
