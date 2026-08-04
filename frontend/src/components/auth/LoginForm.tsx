import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LoginRequest } from "@/types/auth";

import { loginSchema, type LoginFormValues } from "../../utils/validators";
import { login } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";

const inputIconClass =
  "ml-[18px] size-[17px] shrink-0 text-emerald-600/70";

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      organizationCode: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await login(data as LoginRequest);
      const { user, accessToken } = response.data;

      authLogin(user, accessToken);
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputShellClass = (hasError: boolean) =>
    cn(
      "flex min-h-[52px] items-center rounded-full border border-emerald-200/50 bg-white/80 backdrop-blur-sm shadow-sm",
      "transition-[border-color,box-shadow,background] duration-150",
      "focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100/60 focus-within:shadow-md",
      hasError && "border-red-300/80 ring-3 ring-red-100/40",
    );

  const inputClass =
    "h-[50px] rounded-full border-0 bg-transparent px-[14px] py-0 pl-[11px] text-[0.9rem] text-foreground shadow-none " +
    "placeholder:text-stone-400 focus-visible:border-0 focus-visible:ring-0 " +
    "aria-invalid:ring-0 aria-invalid:border-0 " +
    "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] " +
    "[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgba(255,255,255,0.8)_inset] " +
    "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

  return (
    <section
      className={cn(
        "w-full rounded-[28px] border border-emerald-200/60 bg-white/70 backdrop-blur-xl p-[32px]",
        "shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]",
        "max-[520px]:rounded-[22px] max-[520px]:px-5 max-[520px]:py-[26px]",
      )}
      aria-labelledby="login-form-title"
    >
      <h2
        id="login-form-title"
        className="mb-6 text-center text-[1.2rem] font-semibold text-emerald-800"
      >
        Đăng nhập
      </h2>

      <form
        className="flex flex-col gap-3.5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* Tên đăng nhập */}
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="username">
            Tên đăng nhập
          </Label>

          <div className={inputShellClass(Boolean(errors.username))}>
            <UserRound
              className={inputIconClass}
              aria-hidden="true"
            />

            <Input
              id="username"
              autoComplete="username"
              autoFocus
              aria-invalid={Boolean(errors.username)}
              className={inputClass}
              placeholder="Tên đăng nhập"
              {...register("username")}
            />
          </div>

          {errors.username && (
            <p className="mx-4 text-xs text-red-500" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="password">
            Mật khẩu
          </Label>

          <div className={inputShellClass(Boolean(errors.password))}>
            <LockKeyhole
              className={inputIconClass}
              aria-hidden="true"
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              className={inputClass}
              placeholder="Mật khẩu"
              {...register("password")}
            />

            <button
              type="button"
              className={cn(
                "mr-[5px] grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-full",
                "border-0 bg-transparent text-stone-400 hover:text-emerald-600",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400",
              )}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={
                showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
              }
              title={
                showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
              }
            >
              {showPassword ? (
                <EyeOff className="size-[17px]" aria-hidden="true" />
              ) : (
                <Eye className="size-[17px]" aria-hidden="true" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mx-4 text-xs text-red-500" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Mã tổ chức - luôn hiển thị */}
        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="organizationCode">
            Mã tổ chức
          </Label>

          <div
            className={inputShellClass(Boolean(errors.organizationCode))}
          >
            <Building2 className={inputIconClass} aria-hidden="true" />

            <Input
              id="organizationCode"
              autoComplete="organization"
              aria-invalid={Boolean(errors.organizationCode)}
              className={inputClass}
              placeholder="Mã tổ chức"
              {...register("organizationCode")}
            />
          </div>

          {errors.organizationCode && (
            <p className="mx-4 text-xs text-red-500" role="alert">
              {errors.organizationCode.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className={cn(
            "mt-0.5 h-[52px] w-full rounded-full bg-emerald-600",
            "text-[0.92rem] font-semibold text-white shadow-lg shadow-emerald-200",
            "hover:bg-emerald-700 transition-all duration-200",
            "focus-visible:border-white focus-visible:ring-emerald-300/50",
          )}
          disabled={isLoading}
        >
          {isLoading && (
            <LoaderCircle className="animate-spin mr-2" aria-hidden="true" />
          )}
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[0.72rem] text-stone-400">
        Bảo mật & minh bạch – Truy xuất nguồn gốc thực vật
      </p>
    </section>
  );
};