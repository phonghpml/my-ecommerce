import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

// 1. Định nghĩa Schema validate dữ liệu đầu vào bằng Zod
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function POST(req: Request) {
  try {
    // 2. Kiểm tra JWT_SECRET ngay từ đầu
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("Missing JWT_SECRET environment variable");
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    // 3. Parse và validate request body
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      // Trả về lỗi validate nếu dữ liệu không đúng định dạng
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 4. Tìm user theo email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // 5. Bảo mật: Dùng chung một thông báo lỗi để tránh dò quét email (User Enumeration)
    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // 6. So sánh mật khẩu
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // 7. Tạo JWT bằng jose
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    // 8. Cấu hình Cookie an toàn hơn
    const response = NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, role: user.role } 
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Giúp chống tấn công CSRF
      maxAge: 3600,    // 1 giờ
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Đã có lỗi xảy ra, vui lòng thử lại sau" }, { status: 500 });
  }
}