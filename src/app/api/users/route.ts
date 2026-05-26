import { db } from "@/db/client";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { eq, or, ilike } from "drizzle-orm"; // 🌟 Đã thêm ilike và or để phục vụ tìm kiếm API
import { createUserSchema, type CreateUserInput } from "@/validators/user"; 

// Các cột an toàn trả về Client (không bao gồm mật khẩu băm)
const safeSelectFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt, 
};

// =======================================================================
// GET /api/users → Lấy danh sách toàn bộ hoặc tìm kiếm người dùng qua API
// =======================================================================
export async function GET(req: Request) {
  try {
    // 🌟 Lấy tham số truy vấn "?search=..." từ URL request
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    let allUsers;

    if (search) {
      // Nếu có từ khóa tìm kiếm, thực hiện truy vấn lọc theo Tên hoặc Email dưới Database
      // Sử dụng ilike để tìm kiếm gần đúng và không phân biệt chữ hoa / chữ thường
      allUsers = await db
        .select(safeSelectFields)
        .from(users)
        .where(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`)
          )
        );
    } else {
      // Nếu không có từ khóa tìm kiếm, lấy toàn bộ danh sách người dùng như cũ
      allUsers = await db.select(safeSelectFields).from(users);
    }

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("[USERS_GET_ERROR]:", error);
    return NextResponse.json({ error: "Không thể lấy danh sách người dùng" }, { status: 500 });
  }
}

// =======================================================================
// POST /api/users → Tạo mới một tài khoản người dùng (Admin hành động)
// =======================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào thông qua Validator Schema (Zod)
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Dữ liệu không hợp lệ";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, role }: CreateUserInput = parsed.data;

    // Kiểm tra trùng lặp Email hoặc Tên tài khoản đồng thời trong Database
    const [existingEmail, existingName] = await Promise.all([
      db.select().from(users).where(eq(users.email, email)).limit(1),
      db.select().from(users).where(eq(users.name, name)).limit(1)
    ]);

    const dbErrors: string[] = [];
    if (existingEmail.length > 0) dbErrors.push("Email này đã được đăng ký sử dụng.");
    if (existingName.length > 0) dbErrors.push("Tên tài khoản này đã tồn tại, vui lòng chọn tên khác.");

    // Nếu phát hiện trùng lặp, gộp thông báo gửi về để Frontend bẫy lỗi đỏ trực tiếp vào ô tương ứng
    if (dbErrors.length > 0) {
      return NextResponse.json({ error: dbErrors.join(" | ") }, { status: 400 });
    }

    // Thực hiện băm mật khẩu bảo mật trước khi lưu trữ
    const passwordHash = await bcrypt.hash(password, 10);

    // Chèn bản ghi mới vào bảng dữ liệu
    const newUser = await db
      .insert(users)
      .values({ 
        name, 
        email, 
        passwordHash, 
        role: role ?? "user" 
      })
      .returning(safeSelectFields);

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("[USERS_POST_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo tài khoản" }, { status: 500 });
  }
}