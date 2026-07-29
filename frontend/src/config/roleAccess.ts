export const AUTHENTICATED_ROLE_CODES = [
  'VT-01',
  'VT-02',
  'VT-03',
  'VT-04',
  'VT-05',
] as const;

export type AuthenticatedRoleCode = (typeof AUTHENTICATED_ROLE_CODES)[number];
export type RoleCode = AuthenticatedRoleCode | 'VT-06';

export const ROLE_LABELS: Record<RoleCode, string> = {
  'VT-01': 'Quản trị viên nền tảng',
  'VT-02': 'Quản lý hợp tác xã',
  'VT-03': 'Người ghi sự kiện',
  'VT-04': 'Doanh nghiệp thu mua',
  'VT-05': 'Cán bộ quản lý ngành',
  'VT-06': 'Người tiêu dùng tra cứu',
};

export const ROLE_ACCESS = {
  dashboard: AUTHENTICATED_ROLE_CODES,
  organizationCreate: ['VT-01'],
  organizationProfile: ['VT-01', 'VT-02'],
  farmAreaCreate: ['VT-02'],
  productionLotList: ['VT-01', 'VT-02', 'VT-03'],
  productionLotEdit: ['VT-02'],

  packagingEventCreate: ['VT-02', 'VT-03'] as const,
  packagingEventCorrect: ['VT-02', 'VT-03'] as const,

  codeRangeList: ['VT-01'] as const,
} as const satisfies Record<string, readonly AuthenticatedRoleCode[]>;

export function hasAnyRole(
  roleCode: string | null | undefined,
  allowedRoles: readonly string[],
): boolean {
  return Boolean(roleCode && allowedRoles.includes(roleCode));
}

export function getRoleLabel(roleCode: string | null | undefined): string {
  if (!roleCode) return 'Người dùng';
  return ROLE_LABELS[roleCode as RoleCode] ?? roleCode;
}