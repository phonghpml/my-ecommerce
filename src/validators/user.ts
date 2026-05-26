import { z } from "zod";

// Schema cho hành động TẠO MỚI Người dùng (Admin POST)
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải từ 2 ký tự trở lên")
    .trim(),

  email: z
    .email({ message: "Email không đúng định dạng" })
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),

  role: z
    .enum(["user", "admin"])
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;


// Schema cho hành động CẬP NHẬT Người dùng (PUT)
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải từ 2 ký tự trở lên")
    .trim()
    .optional(),

  email: z
    .email({ message: "Email không đúng định dạng" })
    .toLowerCase()
    .trim()
    .optional(),

  role: z
    .enum(["user", "admin"])
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;