"use client";

import { useRouter } from "next/navigation";
import AuthLayout from "../AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtpInput } from "@/validators/auth";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);    
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); 
  const [countdown, setCountdown] = useState(0);

  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    setError,
    clearErrors, 
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onBlur", 
    criteriaMode: "all", // 🌟 BẬT: Quét và hiển thị đồng loạt toàn bộ lỗi input cùng lúc
    defaultValues: {
      name: "",
      email: "",
      password: "",
      otp: "000000",
    },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (isOtpSent) {
      const combinedOtp = otpValues.join("");
      setValue("otp", combinedOtp, { shouldValidate: isOtpSent });
    }
  }, [otpValues, setValue, isOtpSent]);

  // Xóa chữ đỏ báo lỗi của riêng ô input đó + ẩn lỗi tổng hệ thống khi user gõ phím sửa đổi dữ liệu
  const handleInputChange = (fieldName: keyof VerifyOtpInput) => {
    clearErrors(fieldName); 
    if (generalError) setGeneralError(null); 
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);
    
    clearErrors("otp");
    if (generalError) setGeneralError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = "";
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
      }
      clearErrors("otp");
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);
      clearErrors("otp");
      inputRefs.current[5]?.focus();
    }
  };

  // Bước 1: Gửi mã OTP & bẫy lỗi trùng lặp từ Database hiển thị đồng thời
  const handleSendOtp = async () => {
    if (countdown > 0) return;

    setGeneralError(null);
    setIsSendingOtp(true);

    const email = getValues("email");
    const name = getValues("name");
    const password = getValues("password");

    let hasClientError = false;

    // Kiểm tra định dạng đồng loạt ở phía Client (Không chặn return giữa chừng)
    if (!name || name.length < 2) {
      setError("name", { message: "Tên phải có ít nhất 2 ký tự" });
      hasClientError = true;
    }
    if (!email || !email.includes("@")) {
      setError("email", { message: "Email không đúng định dạng" });
      hasClientError = true;
    }
    if (!password || password.length < 6) {
      setError("password", { message: "Mật khẩu phải từ 6 ký tự trở lên" });
      hasClientError = true;
    }

    if (hasClientError) {
      setIsSendingOtp(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }), // Truyền đồng thời cả email và name lên Backend
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsOtpSent(true);
        setOtpValues(new Array(6).fill("")); 
        setCountdown(60); 
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        const errorMsg = result.error || "";
        const lowErrorMsg = errorMsg.toLowerCase();
        
        let splitErrorHandled = false;

        // Tách chuỗi lỗi gộp từ Backend trả về và gán lỗi đỏ chính xác vào từng ô nhập
        if (lowErrorMsg.includes("email")) {
          const emailError = errorMsg.split(" | ").find((msg:string) => msg.toLowerCase().includes("email"));
          setError("email", { message: emailError || "Email đã được đăng ký sử dụng." });
          splitErrorHandled = true;
        }
        
        if (lowErrorMsg.includes("tên") || lowErrorMsg.includes("tài khoản") || lowErrorMsg.includes("name")) {
          const nameError = errorMsg.split(" | ").find((msg:string) => !msg.toLowerCase().includes("email"));
          setError("name", { message: nameError || "Tên tài khoản này đã tồn tại." });
          splitErrorHandled = true;
        }

        if (!splitErrorHandled) {
          setGeneralError(result.error || "Không thể gửi OTP, vui lòng thử lại.");
        }
      }
    } catch (err) {
      setGeneralError("Đã có lỗi xảy ra khi kết nối tới hệ thống.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Bước 2: Điền mã OTP xong bấm nút gửi xác thực cuối cùng
  const onSubmit = async (data: VerifyOtpInput) => {
    if (data.otp.length !== 6) {
      setError("otp", { message: "Vui lòng nhập đầy đủ 6 chữ số mã OTP" });
      return;
    }

    setGeneralError(null);
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Đăng ký tài khoản thành công!");
        router.push("/auth/login");
      } else {
        const errorMsg = result.error || "";
        const lowErrorMsg = errorMsg.toLowerCase();

        if (lowErrorMsg.includes("otp") || lowErrorMsg.includes("mã")) {
          setError("otp", { message: result.error });
        } else if (lowErrorMsg.includes("email")) {
          setError("email", { message: result.error });
        } else if (lowErrorMsg.includes("tên") || lowErrorMsg.includes("tài khoản") || lowErrorMsg.includes("name")) {
          setError("name", { message: result.error });
        } else {
          setGeneralError(result.error || "Xác thực OTP thất bại.");
        }
      }
    } catch (err) {
      setGeneralError("Lỗi hệ thống, vui lòng đăng ký lại sau.");
    } finally {
      setIsVerifyingOtp(false);
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
        <h1 className="text-2xl font-bold text-center">Đăng ký tài khoản</h1>

        {generalError && (
          <p className="p-3 bg-red-500/10 text-red-500 text-sm rounded border border-red-500/20 text-center">
            {generalError}
          </p>
        )}

        {/* Name Input */}
        <div>
          <input
            {...register("name")}
            onChange={(e) => {
              register("name").onChange(e); 
              handleInputChange("name"); 
            }}
            disabled={isOtpSent}
            placeholder="Tên hiển thị"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-[var(--color-background)] text-[var(--color-foreground)] disabled:opacity-50"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Input */}
        <div>
          <input
            {...register("email")}
            onChange={(e) => {
              register("email").onChange(e);
              handleInputChange("email"); 
            }}
            disabled={isOtpSent}
            placeholder="Email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-[var(--color-background)] text-[var(--color-foreground)] disabled:opacity-50"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div>
          <input
            type="password"
            {...register("password")}
            onChange={(e) => {
              register("password").onChange(e);
              handleInputChange("password"); 
            }}
            disabled={isOtpSent}
            placeholder="Mật khẩu"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400
                       bg-[var(--color-background)] text-[var(--color-foreground)] disabled:opacity-50"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* ZONE 6 Ô NHẬP OTP RỜI */}
        {isOtpSent && (
          <div className="pt-2 border-t border-dashed border-[color-mix(in srgb, var(--color-foreground) 20%, transparent)] text-center space-y-3">
            <label className="block text-sm font-medium text-blue-400">
              Nhập mã bảo mật gồm 6 số:
            </label>
            
            <div className="flex justify-center gap-2" dir="ltr">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  onPaste={handleOtpPaste}
                  className="w-12 h-12 border-2 rounded-md text-center text-xl font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20
                             bg-[var(--color-background)] text-[var(--color-foreground)] transition-all"
                />
              ))}
            </div>
            
            <input type="hidden" {...register("otp")} />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}

            <div className="text-sm text-center">
              <p className="text-gray-400">
                Bạn chưa nhận được mã?{" "}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || isSendingOtp}
                  className="text-blue-400 font-semibold hover:underline hover:text-blue-500 
                             disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingOtp ? "Đang gửi lại..." : countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* KHU VỰC NÚT ĐIỀU HƯỚNG CHÍNH */}
        {!isOtpSent ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            className="w-full py-2 rounded font-semibold transition-colors
                       bg-blue-400 text-white hover:bg-blue-500 shadow-md disabled:bg-gray-400"
          >
            {isSendingOtp ? "Đang gửi mã..." : "Gửi mã xác thực về Email"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={isVerifyingOtp}
            className="w-full py-2 rounded font-semibold transition-colors
                       bg-emerald-500 text-white hover:bg-emerald-600 shadow-md disabled:bg-gray-400"
          >
            {isVerifyingOtp ? "Đang xác thực..." : "Xác nhận & Hoàn tất Đăng ký"}
          </button>
        )}

        <p className="text-center text-sm">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="text-blue-400 font-medium hover:underline">
            Đăng nhập
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}