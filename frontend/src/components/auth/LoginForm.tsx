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
  "ml-[18px] size-[17px] shrink-0 text-muted-foreground";

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOrganizationCode, setShowOrganizationCode] = useState(false);

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
      "flex min-h-[52px] items-center rounded-full border border-transparent bg-muted",
      "transition-[border-color,box-shadow,background] duration-150",
      "focus-within:border-ring/60 focus-within:bg-white focus-within:ring-4 focus-within:ring-ring/10",
      hasError && "border-destructive/60 ring-3 ring-destructive/10",
    );

  const inputClass =
    "h-[50px] rounded-full border-0 bg-transparent px-[14px] py-0 pl-[11px] text-[0.9rem] text-foreground shadow-none " +
    "placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0 " +
    "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] " +
    "[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#eff0ed_inset] " +
    "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

  return (
    <section
      className={cn(
        "w-full rounded-[22px] border border-primary/30 bg-card/85 p-[30px] backdrop-blur-md",
        "shadow-card",
        "max-[520px]:rounded-[20px] max-[520px]:px-5 max-[520px]:py-[26px]",
      )}
      aria-labelledby="login-title"
    >
      <header className="mb-6 text-center">
        <p className="mb-1 text-[0.7rem] font-bold tracking-[0.11em] text-primary uppercase">
          Chào mừng trở lại
        </p>

        <h2
          id="login-title"
          className="text-[1.55rem] font-bold tracking-[-0.02em] text-foreground"
        >
          Đăng nhập
        </h2>

        <p className="mt-1.5 text-[0.82rem] text-muted-foreground">
          Nhập thông tin tài khoản để truy cập hệ thống
        </p>
      </header>

      <form
        className="flex flex-col gap-3.5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
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
            <p
              className="mx-4 text-xs text-destructive"
              role="alert"
            >
              {errors.username.message}
            </p>
          )}
        </div>

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
                "border-0 bg-transparent text-muted-foreground",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
              onClick={() => {
                setShowPassword((current) => !current);
              }}
              aria-label={
                showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
              }
              title={
                showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
              }
            >
              {showPassword ? (
                <EyeOff
                  className="size-[17px]"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="size-[17px]"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>

          {errors.password && (
            <p
              className="mx-4 text-xs text-destructive"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="button"
          className={cn(
            "-mt-0.5 cursor-pointer self-center border-0 bg-transparent",
            "text-xs font-medium text-primary",
            "hover:text-primary-hover hover:underline hover:underline-offset-3",
            "focus-visible:rounded focus-visible:outline-2",
            "focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
          onClick={() => {
            setShowOrganizationCode((current) => !current);
          }}
          aria-expanded={showOrganizationCode}
          aria-controls="organization-code-field"
        >
          {showOrganizationCode
            ? "Ẩn mã tổ chức"
            : "Đăng nhập bằng mã tổ chức"}
        </button>

        {showOrganizationCode && (
          <div
            id="organization-code-field"
            className="flex flex-col gap-1.5"
          >
            <Label
              className="sr-only"
              htmlFor="organizationCode"
            >
              Mã tổ chức
            </Label>

            <div
              className={inputShellClass(
                Boolean(errors.organizationCode),
              )}
            >
              <Building2
                className={inputIconClass}
                aria-hidden="true"
              />

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
              <p
                className="mx-4 text-xs text-destructive"
                role="alert"
              >
                {errors.organizationCode.message}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className={cn(
            "mt-0.5 h-[52px] w-full rounded-full bg-primary",
            "text-[0.92rem] font-semibold text-primary-foreground shadow-card",
            "hover:bg-primary-hover",
            "focus-visible:border-white focus-visible:ring-ring/20",
          )}
          disabled={isLoading}
        >
          {isLoading && (
            <LoaderCircle
              className="animate-spin"
              aria-hidden="true"
            />
          )}

          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </section>
  );
};