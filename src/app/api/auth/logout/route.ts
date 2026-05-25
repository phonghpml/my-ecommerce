import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Tạo response xoá cookie token
    const response = NextResponse.json({ success: true });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // hết hạn ngay lập tức
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
