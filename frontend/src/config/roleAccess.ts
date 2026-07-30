export type AuthenticatedRoleCode = 'VT-01' | 'VT-02' | 'VT-03' | 'VT-04' | 'VT-05';

export const AUTHENTICATED_ROLE_CODES: AuthenticatedRoleCode[] = ['VT-01', 'VT-02', 'VT-03', 'VT-04', 'VT-05'];

export const ROLE_ACCESS = {
  dashboard: AUTHENTICATED_ROLE_CODES,
  organizationCreate: ['VT-01'],
  organizationList: ['VT-01'],
  organizationProfile: ['VT-01', 'VT-02'],
  farmAreaCreate: ['VT-02'],
  productionLotList: ['VT-02', 'VT-03'],
  productionLotEdit: ['VT-02'],

  packagingEventCreate: ['VT-02', 'VT-03'] as const,
  packagingEventCorrect: ['VT-02', 'VT-03'] as const,

  codeRangeList: ['VT-01'] as const,
  
  memberManagement: ['VT-02'] as const,

} as const satisfies Record<string, readonly AuthenticatedRoleCode[]>;

export function hasAnyRole(
  userRole: string | undefined,
  allowedRoles: readonly AuthenticatedRoleCode[],
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as AuthenticatedRoleCode);
}

export function getRoleLabel(roleCode?: string): string {
  const map: Record<string, string> = {
    'VT-01': 'Quản trị viên nền tảng',
    'VT-02': 'Quản lý hợp tác xã',
    'VT-03': 'Người ghi sự kiện',
    'VT-04': 'Doanh nghiệp thu mua',
    'VT-05': 'Cán bộ quản lý ngành',
  };
  return roleCode ? map[roleCode] || 'Người dùng' : 'Người dùng';
}