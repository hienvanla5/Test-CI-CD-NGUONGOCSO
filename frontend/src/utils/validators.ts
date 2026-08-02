import { z } from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, ORGANIZATION_CODE_REGEX } from './constants';
import { ChainEventType } from '@/enums/chainEventType';

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

// --- Organization Profile Schema ---
export const createOrganizationSchema = z
  .object({
    // Thông tin tổ chức
    organizationName: z.string().max(255, 'Tên tổ chức tối đa 255 ký tự'),
    organizationCode: z
      .string()
      .regex(ORGANIZATION_CODE_REGEX, 'Mã tổ chức chỉ chứa chữ hoa, số, gạch dưới và gạch ngang'),
    organizationType: z.enum(['COOPERATIVE', 'ENTERPRISE', 'GOVERNMENT', 'SYSTEM'], {
      required_error: 'Vui lòng chọn loại tổ chức',
    }),
    address: z
      .string()
      .max(255)
      .optional()
      .transform((val) => (val === '' ? undefined : val)),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || PHONE_REGEX.test(val), {
        message: 'Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)',
      })
      .transform((val) => (val === '' ? undefined : val)),
    email: z
      .string()
      .optional()
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Email không hợp lệ',
      })
      .transform((val) => (val === '' ? undefined : val)),

    // Thông tin người quản lý
    fullName: z.string().max(100, 'Họ tên tối đa 100 ký tự'),
    userName: z.string().min(4, 'Tên đăng nhập ít nhất 4 ký tự').max(30, 'Tối đa 30 ký tự'),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Mật khẩu phải có 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'), // Thêm field
    managerPhone: z
      .string()
      .optional()
      .refine((val) => !val || PHONE_REGEX.test(val), {
        message: 'Số điện thoại không hợp lệ',
      })
      .transform((val) => (val === '' ? undefined : val)),
    managerEmail: z.string().email('Email không hợp lệ'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // gán lỗi vào field confirmPassword
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

export const updateProductionLotSchema = z.object({
  name: z.string().min(1, 'Tên lô không được để trống'),
  farmAreaId: z.string().nullable().optional(),
  productCategoryId: z.string().uuid('Vui lòng chọn loại nông sản'),
  expectedQuantity: z.coerce.number().positive('Sản lượng dự kiến phải lớn hơn 0'),
  expectedQuantityUnit: z.string().min(1, "Vui lòng chọn đơn vị sản lượng"),
  plantingDate: z.string().min(1, 'Ngày xuống giống không được để trống'),
});

export type UpdateProductionLotFormValues = z.infer<typeof updateProductionLotSchema>;

export const createCodeRangeSchema = z.object({
  organizationId: z.string().uuid('Vui lòng chọn tổ chức'),
  prefix: z
    .string()
    .min(1, 'Tiền tố mã không được để trống')
    .max(50, 'Tiền tố mã tối đa 50 ký tự')
    .regex(/^[A-Z0-9]+$/, 'Tiền tố chỉ được chứa chữ hoa và số'),
  totalLimit: z.coerce
  .number()
  .positive('Hạn mức phải lớn hơn 0')
  .int('Hạn mức phải là số nguyên'),
});

export type CreateCodeRangeFormValues = z.infer<typeof createCodeRangeSchema>;

export const mobileEventSchema = z
  .object({
    productionLotId: z.string().uuid('Vui lòng chọn lô sản xuất'),
    eventType: z.enum([ChainEventType.HARVEST, ChainEventType.PACKAGING], {
      required_error: 'Vui lòng chọn loại sự kiện',
    }),
    recordedAt: z.string().datetime({ message: 'Thời gian không hợp lệ' }),
    latitude: z.number().min(-90).max(90, 'Vĩ độ không hợp lệ'),
    longitude: z.number().min(-180).max(180, 'Kinh độ không hợp lệ'),
    images: z.array(z.string()).min(1, 'Cần ít nhất 1 ảnh'),
    // dynamic fields
    quantity: z.number().positive('Sản lượng > 0').optional(),
    harvestDate: z.string().date('Ngày thu hoạch không hợp lệ').optional(),
    packagingSpecification: z
      .string()
      .max(255, 'Tối đa 255 ký tự')
      .optional(),
    packagingDate: z.string().date('Ngày đóng gói không hợp lệ').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventType === ChainEventType.HARVEST) {
      if (!data.quantity) {
        ctx.addIssue({ code: 'custom', path: ['quantity'], message: 'Sản lượng bắt buộc' });
      }
      if (!data.harvestDate) {
        ctx.addIssue({ code: 'custom', path: ['harvestDate'], message: 'Ngày thu hoạch bắt buộc' });
      }
    }
    if (data.eventType === ChainEventType.PACKAGING) {
      if (!data.packagingSpecification) {
        ctx.addIssue({ code: 'custom', path: ['packagingSpecification'], message: 'Quy cách bắt buộc' });
      }
      if (!data.packagingDate) {
        ctx.addIssue({ code: 'custom', path: ['packagingDate'], message: 'Ngày đóng gói bắt buộc' });
      }
    }
  });

export type MobileEventFormValues = z.infer<typeof mobileEventSchema>;

// ===== Invitation: Create =====
export const createInvitationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không đúng định dạng'),
  roleId: z.number().int().positive('Vui lòng chọn vai trò'),
  expiryDays: z
    .number()
    .int()
    .min(1, 'Thời hạn tối thiểu 1 ngày')
    .max(30, 'Thời hạn tối đa 30 ngày')
    .optional(),
});
export type CreateInvitationFormValues = z.infer<typeof createInvitationSchema>;

// ===== Invitation: Accept (đăng ký) =====
export const acceptInvitationSchema = z
  .object({
    userName: z
      .string()
      .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
      .max(30, 'Tối đa 30 ký tự')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Chỉ chứa chữ cái, số, gạch ngang và gạch dưới'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải từ 8 đến 50 ký tự')
      .max(50, 'Mật khẩu phải từ 8 đến 50 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
      ),
    fullName: z
      .string()
      .min(1, 'Họ tên không được để trống')
      .max(100, 'Họ tên tối đa 100 ký tự'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(0|\+84)(\s\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d(\s\.)?){7}$/.test(val),
        { message: 'Số điện thoại không hợp lệ' }
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;
