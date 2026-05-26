// src/app/api/products/[id]/route.ts
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

// PUT /api/products/[id] -> Cập nhật sản phẩm
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, price, stock, categoryId } = body;

    // 1. Kiểm tra trùng tên với các sản phẩm KHÁC sản phẩm hiện tại
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.name, name), ne(products.id, id)))
      .limit(1);

    if (existingProduct.length > 0) {
      return NextResponse.json({ error: "Tên sản phẩm này đã bị trùng với sản phẩm khác." }, { status: 400 });
    }

    // 2. Tiến hành cập nhật
    const updatedProduct = await db
      .update(products)
      .set({
        name,
        description,
        price: String(price),
        stock: Number(stock),
        categoryId,
      })
      .where(eq(products.id, id))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm cần cập nhật" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("[PRODUCT_PUT_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// DELETE /api/products/[id] -> Xóa sản phẩm
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const deletedProduct = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm cần xóa" }, { status: 404 });
    }

    return NextResponse.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("[PRODUCT_DELETE_ERROR]:", error);
    // Bẫy lỗi nếu sản phẩm này đã nằm trong một Đơn hàng nào đó (Foreign Key Constraint)
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm này vì dữ liệu đã nằm trong các đơn hàng lịch sử." },
      { status: 400 }
    );
  }
}