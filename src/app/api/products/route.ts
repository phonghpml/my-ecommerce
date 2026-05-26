// src/app/api/products/route.ts
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, ilike } from "drizzle-orm";

// GET /api/products?search=... -> Lấy danh sách hoặc tìm kiếm sản phẩm
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    let allProducts;

    if (search) {
      allProducts = await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`));
    } else {
      allProducts = await db.select().from(products);
    }

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("[PRODUCTS_GET_ERROR]:", error);
    return NextResponse.json({ error: "Không thể lấy danh sách sản phẩm" }, { status: 500 });
  }
}

// POST /api/products -> Thêm mới sản phẩm
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, stock, categoryId } = body;

    // 1. Kiểm tra các trường bắt buộc
    if (!name || !price || !stock || !categoryId) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ các trường bắt buộc" }, { status: 400 });
    }

    // 2. Kiểm tra trùng tên sản phẩm trong DB
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.name, name))
      .limit(1);

    if (existingProduct.length > 0) {
      // Trả về định dạng lỗi phân tách bằng "|" giống hệt bên trang User để Frontend bẫy lỗi đỏ vào ô nhập
      return NextResponse.json({ error: "Tên sản phẩm này đã tồn tại, vui lòng chọn tên khác." }, { status: 400 });
    }

    // 3. Thực hiện chèn vào Database (Lưu ý: price trong schema thường là string/numeric)
    const newProduct = await db
      .insert(products)
      .values({
        name,
        description,
        price: String(price),
        stock: Number(stock),
        categoryId,
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST_ERROR]:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi tạo sản phẩm" }, { status: 500 });
  }
}