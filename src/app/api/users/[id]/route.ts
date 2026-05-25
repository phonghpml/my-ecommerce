import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Types từ schema
type User = InferSelectModel<typeof users>;
type UpdateUser = Partial<InferInsertModel<typeof users>>;

// Schema validate cho PUT
const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

// GET /api/users/:id → lấy user theo id
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // unwrap Promise
  const user = await db.select().from(users).where(eq(users.id, id));
  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user[0]);
}

// PUT /api/users/:id → cập nhật user
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await db.update(users).set(parsed.data).where(eq(users.id, id)).returning();
  return NextResponse.json(updated[0]);
}

// DELETE /api/users/:id → xóa user
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const deleted = await db.delete(users).where(eq(users.id, id)).returning();
  if (!deleted.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "User deleted", user: deleted[0] });
}
