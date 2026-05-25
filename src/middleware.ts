import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Bỏ qua API auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Nếu chưa login
  if (!token) {
    if (!pathname.startsWith("/auth/login") && !pathname.startsWith("/auth/register")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  // Nếu đã login
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
      return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/user", req.url));
    }

    // Nếu vào root "/" → chuyển sang đúng trang
    if (pathname === "/") {
      return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/user", req.url));
    }

    // Nếu vào /admin mà không phải admin → chuyển sang /user
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/user", req.url));
    }

    console.log("Allow access to:", pathname);
  } catch (err) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
