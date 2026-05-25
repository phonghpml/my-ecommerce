"use client";

import { useRouter } from "next/navigation";
import AuthLayout from "../AuthLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      router.push("/auth/login");
    } else {
      setError("email", { message: result.error || "Register failed" });
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
        <h1 className="text-2xl font-bold text-center">Register</h1>

        <input
          {...register("name")}
          placeholder="Name"
          className="w-full border rounded px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-[var(--color-background)] text-[var(--color-foreground)]"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}

        <input
          {...register("email")}
          placeholder="Email"
          className="w-full border rounded px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-[var(--color-background)] text-[var(--color-foreground)]"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}

        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="w-full border rounded px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     bg-[var(--color-background)] text-[var(--color-foreground)]"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded font-semibold transition-colors
                     bg-blue-400 text-white hover:bg-blue-500 shadow-md"
        >
          Register
        </button>

        <p className="text-center text-sm">
          Đã có tài khoản?{" "}
          <a
            href="/auth/login"
            className="text-blue-400 font-medium hover:underline"
          >
            Đăng nhập
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
