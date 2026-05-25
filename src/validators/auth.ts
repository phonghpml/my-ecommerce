// src/validators/auth.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50, "Tên quá dài").trim(),
  email: z.string().email("Email không đúng định dạng").toLowerCase().trim(),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50, "Tên quá dài").trim(),
  email: z.string().email("Email không đúng định dạng").toLowerCase().trim(),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
  otp: z.string().length(6, "Mã OTP phải có đúng 6 chữ số"), // Xác thực định dạng OTP ngắn gọn trước khi xuống DB
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;