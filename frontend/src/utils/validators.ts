import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  organizationCode: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const organizationProfileSchema = z.object({
  name: z.string().min(1, 'Tên tổ chức không được để trống'),
  address: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      { message: 'Số điện thoại phải có 10-11 chữ số' }
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'Email không hợp lệ' }
    ),
});

export type OrganizationProfileFormValues = z.infer<typeof organizationProfileSchema>;