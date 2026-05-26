import { z } from "zod";

// Schema xác thực Đăng ký + Mã OTP
export const verifyOtpSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên quá dài")
    .trim(),

  email: z
    .email({ message: "Email không đúng định dạng" })
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),

  otp: z
    .string()
    .length(6, { message: "Mã OTP phải có đúng 6 chữ số" }),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

// Sau này bạn có thể thêm loginSchema, forgotPasswordSchema... vào đây luôn