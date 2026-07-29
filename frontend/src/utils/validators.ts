import { z } from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, ORGANIZATION_CODE_REGEX } from './constants';

export const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  organizationCode: z.string().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// --- Organization Profile Schema ---
export const organizationProfileSchema = z.object({
  name: z.string().min(1, 'Tên tổ chức không được để trống'),
  address: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Số điện thoại phải có 10-11 chữ số và bắt đầu bằng 0 hoặc +84',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Email không hợp lệ',
    }),
});
export type OrganizationProfileFormValues = z.infer<typeof organizationProfileSchema>;

// --- Create Organization Schema ---
export const createOrganizationSchema = z.object({
  // Thông tin tổ chức
  organizationName: z.string().max(255, 'Tên tổ chức tối đa 255 ký tự'),
  organizationCode: z
    .string()
    .regex(ORGANIZATION_CODE_REGEX, 'Mã tổ chức chỉ chứa chữ hoa, số, gạch dưới và gạch ngang'),
  organizationType: z.enum(['COOPERATIVE', 'ENTERPRISE', 'GOVERNMENT', 'SYSTEM'], {
    required_error: 'Vui lòng chọn loại tổ chức',
  }),
  address: z.string().max(255).optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Email không hợp lệ',
    }),

  // Thông tin người quản lý
  fullName: z.string().max(100, 'Họ tên tối đa 100 ký tự'),
  userName: z.string().min(4, 'Tên đăng nhập ít nhất 4 ký tự').max(30, 'Tối đa 30 ký tự'),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      'Mật khẩu phải có 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    ),
  managerPhone: z
    .string()
    .optional()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: 'Số điện thoại không hợp lệ',
    }),
  managerEmail: z.string().email('Email không hợp lệ'),
});
export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
export const createFarmAreaSchema = z.object({
  name: z.string().min(1, 'Tên vùng trồng không được để trống'),
  cropType: z.string().min(1, 'Vui lòng chọn loại cây trồng'),
  latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
  longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
});

export type CreateFarmAreaFormValues = z.infer<typeof createFarmAreaSchema>;