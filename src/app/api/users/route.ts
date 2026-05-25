import { db } from "@/db/client";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Types từ schema
type User = InferSelectModel<typeof users>;        // SELECT
type NewUser = InferInsertModel<typeof users>;     // INSERT

// Schema validate cho POST
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
});

// GET /api/users → lấy tất cả user
export async function GET() {
  const allUsers: User[] = await db.select().from(users);
  return NextResponse.json(allUsers);
}

// POST /api/users → tạo user mới
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const newUser = await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role ?? "user",
  }).returning();

  return NextResponse.json(newUser[0]);
}
