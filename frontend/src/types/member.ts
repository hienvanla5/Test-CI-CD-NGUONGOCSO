export type MemberStatus = 'ACTIVE' | 'INACTIVE';
export type AssignableRoleCode = 'VT-02' | 'VT-03';

export interface OrganizationMember {
  id: number;
  userId: string;
  username: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  roleCode: AssignableRoleCode | null;
  roleName: string | null;
  status: MemberStatus;
}
