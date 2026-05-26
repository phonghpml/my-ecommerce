// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

// 🌟 Import Schema và Type phục vụ luồng cập nhật dữ liệu
import { updateUserSchema, type UpdateUserInput } from "@/validators/user";

// Cấu hình lọc bỏ thông tin nhạy cảm ở đầu ra đầu vào của API
const safeSelectFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};

// ==========================================
// GET /api/users/:id → Lấy thông tin chi tiết một người dùng
// ==========================================
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Unwrap Promise params theo chuẩn Next.js 15+
    
    const user = await db
      .select(safeSelectFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (!user.length) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }
    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("[USER_DETAIL_GET_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi lấy thông tin" }, { status: 500 });
  }
}

// ==========================================
// PUT /api/users/:id → Cập nhật thông tin người dùng (Chặn trùng chéo)
// ==========================================
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    // Sử dụng Schema đã cập nhật cấu hình mới xóa cảnh báo deprecated
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors)[0]?.[0] || "Dữ liệu không hợp lệ";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Chặn gửi dữ liệu rỗng lên Server
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Không có dữ liệu nào thay đổi" }, { status: 400 });
    }

    const updateData: UpdateUserInput = parsed.data;
    const dbChecks = [];
    
    // Kiểm tra trùng Email chéo với người khác (ne: Not Equal - không phải ID hiện tại)
    if (updateData.email) {
      dbChecks.push(
        db.select().from(users).where(and(eq(users.email, updateData.email), ne(users.id, id))).limit(1)
      );
    } else {
      dbChecks.push(Promise.resolve([]));
    }

    // Kiểm tra trùng Name chéo với người khác
    if (updateData.name) {
      dbChecks.push(
        db.select().from(users).where(and(eq(users.name, updateData.name), ne(users.id, id))).limit(1)
      );
    } else {
      dbChecks.push(Promise.resolve([]));
    }

    // Quét đồng thời kiểm tra tính hợp nhất Unique của cơ sở dữ liệu
    const [emailDuplicate, nameDuplicate] = await Promise.all(dbChecks);
    const dbErrors: string[] = [];

    if (emailDuplicate && emailDuplicate.length > 0) {
      dbErrors.push("Email này đã được sử dụng bởi một tài khoản khác.");
    }
    if (nameDuplicate && nameDuplicate.length > 0) {
      dbErrors.push("Tên tài khoản này đã được sử dụng bởi một người khác.");
    }

    if (dbErrors.length > 0) {
      return NextResponse.json({ error: dbErrors.join(" | ") }, { status: 400 });
    }

    // Thực hiện cập nhật dữ liệu vào DB
    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(safeSelectFields);

    if (!updated.length) {
      return NextResponse.json({ error: "Người dùng không tồn tại hoặc cập nhật thất bại" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[USER_PUT_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật thông tin" }, { status: 500 });
  }
}

// ==========================================
// DELETE /api/users/:id → Xóa tài khoản người dùng
// ==========================================
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Xóa người dùng và chỉ lấy các thông tin không nhạy cảm khi trả về log thông báo
    const deleted = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning(safeSelectFields);
    
    if (!deleted.length) {
      return NextResponse.json({ error: "Người dùng không tồn tại hoặc đã bị xóa trước đó" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Xóa người dùng thành công", user: deleted[0] });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi thực hiện xóa" }, { status: 500 });
  }
}