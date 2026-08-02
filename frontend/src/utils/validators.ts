import { z } from 'zod';
import { PHONE_REGEX, PASSWORD_REGEX, ORGANIZATION_CODE_REGEX } from './constants';
import { ChainEventType } from '@/enums/chainEventType';

// ---------- Login ----------
export const loginSchema = z.object({
    username: z.string().min(1, 'Tên đăng nhập không được để trống'),
    password: z.string().min(1, 'Mật khẩu không được để trống'),
    organizationCode: z.string().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------- Organization Profile ----------
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

// ---------- Create Organization ----------
export const createOrganizationSchema = z
    .object({
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
        fullName: z.string().max(100, 'Họ tên tối đa 100 ký tự'),
        userName: z.string().min(4, 'Tên đăng nhập ít nhất 4 ký tự').max(30, 'Tối đa 30 ký tự'),
        password: z
            .string()
            .regex(
                PASSWORD_REGEX,
                'Mật khẩu phải có 8-50 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
            ),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
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
        path: ['confirmPassword'],
    });
export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

// ---------- Farm Area ----------
export const createFarmAreaSchema = z.object({
    name: z.string().min(1, 'Tên vùng trồng không được để trống'),
    cropType: z.string().min(1, 'Vui lòng chọn loại cây trồng'),
    latitude: z.number().min(-90, 'Vĩ độ không hợp lệ').max(90, 'Vĩ độ không hợp lệ'),
    longitude: z.number().min(-180, 'Kinh độ không hợp lệ').max(180, 'Kinh độ không hợp lệ'),
    area: z.number().positive('Diện tích phải lớn hơn 0'),
});
export type CreateFarmAreaFormValues = z.infer<typeof createFarmAreaSchema>;

// ---------- Production Lot ----------
export const updateProductionLotSchema = z.object({
    name: z.string().min(1, 'Tên lô không được để trống'),
    farmAreaId: z.string().nullable().optional(),
    productCategoryId: z.string().uuid('Vui lòng chọn loại nông sản'),
    expectedQuantity: z.coerce.number().positive('Sản lượng dự kiến phải lớn hơn 0'),
    expectedQuantityUnit: z.string().min(1, "Vui lòng chọn đơn vị sản lượng"),
    plantingDate: z.string().min(1, 'Ngày xuống giống không được để trống'),
});
export type UpdateProductionLotFormValues = z.infer<typeof updateProductionLotSchema>;

// ---------- Code Range ----------
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

// ---------- Mobile Event (NCL-10-CN-003) ----------
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

// ---------- Standard (NCL-09-CN-002) ----------
export const standardFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Tên tiêu chuẩn không được để trống')
        .max(255, 'Tên tiêu chuẩn không được vượt quá 255 ký tự'),
    description: z
        .string()
        .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
        .optional(),
    issuingBody: z
        .string()
        .max(255, 'Cơ quan ban hành không được vượt quá 255 ký tự')
        .optional(),
    isActive: z.boolean().optional(),
});
export type StandardFormValues = z.infer<typeof standardFormSchema>;


export const createCertificationSchema = z
  .object({
    standardId: z.string().uuid('Vui lòng chọn tiêu chuẩn'),
    code: z
      .string()
      .min(1, 'Số hiệu chứng nhận không được để trống')
      .max(50, 'Số hiệu chứng nhận tối đa 50 ký tự'),
    issuedBy: z
      .string()
      .max(255, 'Cơ quan cấp tối đa 255 ký tự')
      .optional(),
    issueDate: z.string().date('Ngày cấp không hợp lệ'),
    expiryDate: z.string().date('Ngày hết hạn không hợp lệ'),
  })
  .superRefine((data, ctx) => {
    if (data.issueDate && data.expiryDate) {
      const issue = new Date(data.issueDate);
      const expiry = new Date(data.expiryDate);
      if (expiry < issue) {
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: 'Ngày hết hạn phải sau ngày cấp',
        });
      }
      if (expiry < new Date()) {
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: 'Ngày hết hạn không được là ngày trong quá khứ',
        });
      }
    }
  });

export type CreateCertificationFormValues = z.infer<typeof createCertificationSchema>;
