// src/app/api/categories/route.ts
import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCategories = await db.select().from(categories);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("[CATEGORIES_GET_ERROR]:", error);
    return NextResponse.json({ error: "Không thể tải danh sách danh mục" }, { status: 500 });
  }
}