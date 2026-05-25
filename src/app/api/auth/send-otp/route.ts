// src/app/api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users, verificationTokens } from "@/db/schema";
import { sendOtpEmail } from "@/utils/mailer";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Cập nhật Schema để nhận và kiểm tra cả trường name từ Frontend gửi lên
const sendOtpSchema = z.object({
  email: z.string().email("Email không đúng định dạng").toLowerCase().trim(),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").trim(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const errorMsg = fieldErrors.email?.[0] || fieldErrors.name?.[0] || "Dữ liệu không hợp lệ";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, name } = validation.data;

    // 🌟 CHẠY SONG SONG: Kiểm tra trùng cả Email và Tên hiển thị trong Database cùng lúc
    const [existingUserEmail, existingUserName] = await Promise.all([
      db.select().from(users).where(eq(users.email, email)).limit(1),
      db.select().from(users).where(eq(users.name, name)).limit(1),
    ]);

    // Mảng gom toàn bộ lỗi trùng trong Database
    const dbErrors: string[] = [];

    if (existingUserEmail.length > 0) {
      dbErrors.push("Email này đã được đăng ký sử dụng trong hệ thống.");
    }

    if (existingUserName.length > 0) {
      dbErrors.push("Tên tài khoản này đã tồn tại, vui lòng chọn tên khác.");
    }

    // 🌟 NẾU CÓ LỖI TRÙNG: Gộp các chuỗi lỗi lại ngăn cách bởi ký tự "|" và gửi về một lượt
    if (dbErrors.length > 0) {
      return NextResponse.json(
        { error: dbErrors.join(" | ") },
        { status: 400 }
      );
    }

    // Nếu không trùng, tiến hành dọn dẹp mã OTP cũ và tạo mã mới
    await db.delete(verificationTokens).where(eq(verificationTokens.email, email));

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(verificationTokens).values({
      email,
      token: otpCode,
      expiresAt,
    });

    // Gửi email chứa mã OTP
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({
      success: true,
      message: "Mã OTP đã được gửi thành công về email của bạn.",
    }, { status: 200 });

  } catch (error) {
    console.error("[SEND_OTP_ERROR]:", error);
    return NextResponse.json(
      { error: "Không thể gửi OTP, hệ thống gặp sự cố. Vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}