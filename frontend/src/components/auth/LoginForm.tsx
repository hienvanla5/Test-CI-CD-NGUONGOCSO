import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '../../utils/validators';
import { login } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import type { LoginRequest } from '@/types/auth';

const inputIconClass = 'ml-[18px] size-[17px] shrink-0 text-[#5f6960]';

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
      username: '',
      password: '',
      organizationCode: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await login(data as LoginRequest);
      const { user, accessToken } = response.data;

      authLogin(user, accessToken);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.';

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputShellClass = (hasError: boolean) =>
    cn(
      'flex min-h-[52px] items-center rounded-full border border-transparent bg-[#eff0ed]',
      'transition-[border-color,box-shadow,background] duration-150',
      'focus-within:border-[#4c9741]/60 focus-within:bg-[#f4f6f1] focus-within:ring-4 focus-within:ring-[#4da441]/10',
      hasError && 'border-red-500/60 ring-3 ring-red-500/10',
    );

  const inputClass =
    'h-[50px] rounded-full border-0 bg-transparent px-[14px] py-0 pl-[11px] text-[0.9rem] text-[#203625] shadow-none ' +
    'placeholder:text-[#8a918b] focus-visible:border-0 focus-visible:ring-0';

  return (
    <section
      className={cn(
        'w-full rounded-[22px] border border-[#3e6537]/30 bg-white/85 p-[30px] backdrop-blur-md',
        'shadow-[0_22px_60px_rgba(44,68,38,0.12),0_3px_10px_rgba(44,68,38,0.07)]',
        'max-[520px]:rounded-[20px] max-[520px]:px-5 max-[520px]:py-[26px]',
      )}
      aria-labelledby="login-title"
    >
      <header className="mb-6 text-center">
        <p className="mb-1 text-[0.7rem] font-bold tracking-[0.11em] text-[#4d873e] uppercase">
          Chào mừng trở lại
        </p>
        <h2
          id="login-title"
          className="text-[1.55rem] font-bold tracking-[-0.02em] text-[#172d1c]"
        >
          Đăng nhập
        </h2>
        <p className="mt-1.5 text-[0.82rem] text-[#738075]">
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
            <UserRound className={inputIconClass} aria-hidden="true" />
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              aria-invalid={Boolean(errors.username)}
              className={inputClass}
              placeholder="Tên đăng nhập"
              {...register('username')}
            />
          </div>
          {errors.username && (
            <p className="mx-4 text-xs text-red-600" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="sr-only" htmlFor="password">
            Mật khẩu
          </Label>
          <div className={inputShellClass(Boolean(errors.password))}>
            <LockKeyhole className={inputIconClass} aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              className={inputClass}
              placeholder="Mật khẩu"
              {...register('password')}
            />
            <button
              type="button"
              className={cn(
                'mr-[5px] grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[#637365]',
                'transition-colors hover:bg-[#4c8b3d]/10 hover:text-[#376e35]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65a855]',
              )}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="size-[17px]" /> : <Eye className="size-[17px]" />}
            </button>
          </div>
          {errors.password && (
            <p className="mx-4 text-xs text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="button"
          className={cn(
            '-mt-0.5 cursor-pointer self-center border-0 bg-transparent text-xs font-medium text-[#56804f]',
            'hover:text-[#306f34] hover:underline hover:underline-offset-3',
            'focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65a855]',
          )}
          onClick={() => setShowOrganizationCode((current) => !current)}
          aria-expanded={showOrganizationCode}
          aria-controls="organization-code-field"
        >
          {showOrganizationCode ? 'Ẩn mã tổ chức' : 'Đăng nhập bằng mã tổ chức'}
        </button>

        {showOrganizationCode && (
          <div id="organization-code-field" className="flex flex-col gap-1.5">
            <Label className="sr-only" htmlFor="organizationCode">
              Mã tổ chức
            </Label>
            <div className={inputShellClass(false)}>
              <Building2 className={inputIconClass} aria-hidden="true" />
              <Input
                id="organizationCode"
                autoComplete="organization"
                className={inputClass}
                placeholder="Mã tổ chức (không bắt buộc)"
                {...register('organizationCode')}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className={cn(
            'mt-0.5 h-[52px] w-full rounded-full bg-linear-to-br from-[#5bc348] to-[#48ad3b]',
            'text-[0.92rem] font-semibold text-white shadow-[0_10px_22px_rgba(67,160,57,0.22)]',
            'hover:from-[#50b840] hover:to-[#3d9f34] hover:shadow-[0_12px_28px_rgba(67,160,57,0.28)]',
            'focus-visible:border-white focus-visible:ring-[#4ba43e]/20',
          )}
          disabled={isLoading}
        >
          {isLoading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </section>
  );
};