import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Tìm user theo email
    const result = await db.select().from(users).where(eq(users.email, email));
    const user = result[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // So sánh mật khẩu
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Tạo JWT bằng jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    // Lưu JWT trong httpOnly cookie
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
