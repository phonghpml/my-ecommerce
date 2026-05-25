import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users, verificationTokens } from "@/db/schema";
import { verifyOtpSchema } from "@/validators/auth";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Parse và validate dữ liệu từ Frontend gửi lên
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Dữ liệu không hợp lệ", 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, password, otp } = validation.data;

    // 2. Tìm kiếm và kiểm tra mã OTP trong Database (Cần khớp email, mã OTP và còn hạn)
    const validToken = await db
      .select()
      .from(verificationTokens)
      .where(
        and(
          eq(verificationTokens.email, email),
          eq(verificationTokens.token, otp),
          gt(verificationTokens.expiresAt, new Date()) // Hạn dùng phải lớn hơn thời gian hiện tại
        )
      )
      .limit(1);

    // Nếu không tìm thấy dòng nào khớp => OTP sai hoặc hết hạn
    if (validToken.length === 0) {
      return NextResponse.json(
        { error: "Mã OTP không chính xác hoặc đã hết hạn sử dụng." },
        { status: 400 }
      );
    }

    // 3. OTP hợp lệ hợp pháp -> Tiến hành mã hóa mật khẩu người dùng
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert trực tiếp vào bảng `users`
    const insertedUsers = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashedPassword,
        role: "user",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    const newUser = insertedUsers[0];

    if (!newUser) {
      throw new Error("Không thể tạo dữ liệu người dùng mới");
    }

    // 5. [BẢO MẬT] Xóa sạch các mã OTP liên quan đến email này để tránh việc dùng lại
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.email, email));

    // 6. Phản hồi thành công về Client
    return NextResponse.json(
      { 
        success: true, 
        message: "Xác thực OTP thành công. Tài khoản của bạn đã được khởi tạo!", 
        data: newUser 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("[VERIFY_OTP_ERROR]:", error);

    // Xử lý lỗi trùng unique constraint phòng khi user đổi ý sửa tên/email lúc submit
    if (error.code === "23505") {
      const detail = error.detail?.toLowerCase() || "";
      if (detail.includes("email")) {
        return NextResponse.json({ error: "Email này đã được đăng ký sử dụng" }, { status: 400 });
      }
      if (detail.includes("name")) {
        return NextResponse.json({ error: "Tên tài khoản này đã tồn tại" }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Đăng ký thất bại, hệ thống gặp sự cố. Vui lòng thử lại sau" }, 
      { status: 500 }
    );
  }
}