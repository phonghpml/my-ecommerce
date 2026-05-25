"use client";

import { useRouter } from "next/navigation";
import AuthLayout from "../AuthLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner"; // 🌟 Import sonner

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        // 🌟 Bắn thông báo đăng nhập thành công dạng Toast bồng bềnh
        toast.success("Đăng nhập thành công! Đang chuyển hướng...");
        
        router.push(result.role === "admin" ? "/admin" : "/");
      } else {
        setError("email", { message: result.error || "Đăng nhập thất bại" });
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error("Lỗi kết nối hệ thống, vui lòng thử lại sau");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm p-6 rounded-lg shadow-lg space-y-4
                   bg-[color-mix(in srgb, var(--color-background) 85%, black)]
                   text-[var(--color-foreground)]
                   border border-[color-mix(in srgb, var(--color-foreground) 20%, transparent)]"
      >
        <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>

        {/* Giao diện bên trong form bây giờ cực kỳ sạch sẽ, không cần code khối render thông báo thủ công nữa */}
        
        <div>
          <input
            {...register("email")}
            disabled={isSubmitting}
            placeholder="Email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-[var(--color-background)] text-[var(--color-foreground)] disabled:opacity-50"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            disabled={isSubmitting}
            placeholder="Mật khẩu"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-[var(--color-background)] text-[var(--color-foreground)] disabled:opacity-50"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded font-semibold transition-colors
                     bg-blue-400 text-white hover:bg-blue-500 shadow-md disabled:bg-gray-400"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <a href="/auth/register" className="text-blue-400 font-medium hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}