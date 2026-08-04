import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganizationSchema, type CreateOrganizationFormValues } from '@/utils/validators';
import { createOrganization } from '@/api/organizationApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORGANIZATION_TYPES } from '@/utils/constants';

export function CreateOrganizationForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      organizationType: 'COOPERATIVE',
      address: '',
      phone: '',
      email: '',
      managerPhone: '',
      confirmPassword: '', // thêm
    },
  });

  const organizationType = watch('organizationType');

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      // Loại bỏ confirmPassword trước khi gửi (back-end không cần)
      const { confirmPassword, ...submitData } = values;
      const result = await createOrganization(submitData);
      toast.success(`Tổ chức "${result.data.organizationName}" đã được tạo thành công!`);
      navigate('/organizations');
    } catch (error: any) {
      const response = error.response?.data;
      if (response?.status === 400 && response?.errors) {
        Object.entries(response.errors).forEach(([key, message]) => {
          setError(key as keyof CreateOrganizationFormValues, {
            message: message as string,
          });
        });
      } else {
        toast.error(response?.message || 'Có lỗi xảy ra khi tạo tổ chức');
      }
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tạo tổ chức mới</CardTitle>
        <CardDescription>
          Nhập thông tin tổ chức và tài khoản quản lý ban đầu. Các trường có dấu * là bắt buộc.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Thông tin tổ chức - giữ nguyên */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Thông tin tổ chức</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Tên tổ chức *</Label>
                <Input
                  id="organizationName"
                  {...register('organizationName')}
                  placeholder="VD: Công ty ABC"
                />
                {errors.organizationName && (
                  <p className="text-sm text-red-500">{errors.organizationName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationCode">Mã tổ chức *</Label>
                <Input
                  id="organizationCode"
                  {...register('organizationCode')}
                  placeholder="VD: TC01"
                />
                {errors.organizationCode && (
                  <p className="text-sm text-red-500">{errors.organizationCode.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Loại tổ chức *</Label>
              <Select
                items={Object.entries(ORGANIZATION_TYPES).map(([key, label]) => ({
                  value: key,
                  label,
                }))}
                value={organizationType}
                onValueChange={(value) => setValue('organizationType', value as any)}
              >
                <SelectTrigger id="organizationType">
                  <SelectValue placeholder="Chọn loại tổ chức" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORGANIZATION_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationType && (
                <p className="text-sm text-red-500">{errors.organizationType.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="VD: Hà Nội"
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="VD: 024567890"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register('email')}
                placeholder="contact@abc.com"
                type="email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Thông tin người quản lý */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Người quản lý ban đầu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ tên *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Trần Văn B"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="userName">Tên đăng nhập *</Label>
                <Input
                  id="userName"
                  {...register('userName')}
                  placeholder="admin01"
                />
                {errors.userName && (
                  <p className="text-sm text-red-500">{errors.userName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pr-8 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  {...register('password')}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Thêm trường xác nhận mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pr-8 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  {...register('confirmPassword')}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="managerPhone">Số điện thoại quản lý</Label>
                <Input
                  id="managerPhone"
                  {...register('managerPhone')}
                  placeholder="0395724804"
                />
                {errors.managerPhone && (
                  <p className="text-sm text-red-500">{errors.managerPhone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">Email quản lý *</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  {...register('managerEmail')}
                  placeholder="admin@abc.com"
                />
                {errors.managerEmail && (
                  <p className="text-sm text-red-500">{errors.managerEmail.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/organizations')}
          >
            Hủy
          </Button>
          <Button type="submit" variant="create" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo tổ chức'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}