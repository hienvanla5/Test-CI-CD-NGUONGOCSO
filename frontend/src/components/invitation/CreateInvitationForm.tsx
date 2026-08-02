import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  createInvitationSchema,
  type CreateInvitationFormValues,
} from '@/utils/validators';
import { createInvitation } from '@/api/invitationApi';
import { getRoles } from '@/api/memberApi';
import type { RoleOption } from '@/types/member';
import { getRoleLabel } from '@/config/roleAccess';
import { Loader2, Mail } from 'lucide-react';

export const CreateInvitationForm: React.FC = () => {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInvitationFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      email: '',
      roleId: undefined,
      expiryDays: 7,
    },
  });

  // Lấy danh sách vai trò (bỏ VT-01)
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        // Lọc bỏ VT-01 – chỉ mời VT-03, VT-04, VT-05
        const filtered = data.filter(
          (r) => r.code !== 'VT-01' && r.code !== 'VT-02'
        );
        setRoles(filtered);
      } catch (error) {
        toast.error('Không thể tải danh sách vai trò');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (data: CreateInvitationFormValues) => {
    setSubmitting(true);
    try {
      await createInvitation(data);
      toast.success('Thư mời đã được gửi thành công!');
      reset();
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) {
        toast.error('Người dùng này đã là thành viên của tổ chức.');
      } else if (status === 404) {
        toast.error('Vai trò không tồn tại.');
      } else {
        toast.error(message || 'Không thể gửi thư mời.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Mời thành viên tham gia tổ chức</CardTitle>
        <CardDescription>
          Gửi thư mời qua email để thành viên mới đăng ký và tham gia tổ chức của bạn.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  {...field}
                  disabled={submitting}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Vai trò */}
          <div className="space-y-2">
            <Label htmlFor="roleId">Vai trò *</Label>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ''}
                  onValueChange={(val) => {
                    if (val !== null && val !== undefined) {
                      field.onChange(parseInt(val));
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.roleId} value={role.roleId.toString()}>
                        {getRoleLabel(role.code)} ({role.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.roleId && (
              <p className="text-sm text-red-500">{errors.roleId.message}</p>
            )}
          </div>

          {/* Thời hạn */}
          <div className="space-y-2">
            <Label htmlFor="expiryDays">Thời hạn (ngày)</Label>
            <Controller
              name="expiryDays"
              control={control}
              render={({ field }) => (
                <Input
                  id="expiryDays"
                  type="number"
                  min="1"
                  max="30"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                  disabled={submitting}
                />
              )}
            />
            {errors.expiryDays && (
              <p className="text-sm text-red-500">{errors.expiryDays.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Gửi thư mời
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};