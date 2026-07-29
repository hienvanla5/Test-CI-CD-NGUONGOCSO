import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AssignableRoleCode, OrganizationMember } from '@/types/member';
import { Search, ShieldCheck, UserRoundCog, X } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

const initialMembers: OrganizationMember[] = [
  { id: 1, userId: 'u-01', username: 'tranvannhu', fullName: 'Trần Văn Nhu', email: 'nhu.tran@phuthinh.vn', phone: '0901 234 567', roleCode: 'VT-02', roleName: 'Quản lý hợp tác xã', status: 'ACTIVE' },
  { id: 2, userId: 'u-02', username: 'nguyenthihuong', fullName: 'Nguyễn Thị Hương', email: 'huong.nguyen@phuthinh.vn', phone: '0912 536 789', roleCode: 'VT-03', roleName: 'Người ghi sự kiện', status: 'ACTIVE' },
  { id: 3, userId: 'u-03', username: 'leminhhai', fullName: 'Lê Minh Hải', email: 'hai.le@phuthinh.vn', phone: '0987 112 345', roleCode: 'VT-03', roleName: 'Người ghi sự kiện', status: 'ACTIVE' },
  { id: 4, userId: 'u-04', username: 'phamthuha', fullName: 'Phạm Thu Hà', email: 'ha.pham@phuthinh.vn', phone: '0908 442 190', roleCode: 'VT-03', roleName: 'Người ghi sự kiện', status: 'INACTIVE' },
  { id: 5, userId: 'u-05', username: 'hoangngoclan', fullName: 'Hoàng Ngọc Lan', email: 'lan.hoang@phuthinh.vn', phone: '0974 320 118', roleCode: null, roleName: null, status: 'ACTIVE' },
];

const roleNames: Record<AssignableRoleCode, string> = {
  'VT-02': 'Quản lý hợp tác xã',
  'VT-03': 'Người ghi sự kiện',
};

const roleBadgeClasses: Record<AssignableRoleCode, string> = {
  'VT-02': 'bg-blue-100 text-blue-700',
  'VT-03': 'bg-purple-100 text-purple-700',
};

const getRoleBadgeClass = (roleCode: AssignableRoleCode | null) => {
  if (!roleCode) {
    return 'bg-slate-100 text-slate-500';
  }

  return roleBadgeClasses[roleCode];
};

export const MemberPermissions = () => {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<AssignableRoleCode>('VT-03');

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !keyword || [
        member.username,
        member.fullName,
        member.email ?? '',
        member.phone ?? '',
      ].some((value) => value.toLowerCase().includes(keyword));
      const matchesRole = roleFilter === 'ALL'
        || (roleFilter === 'NONE' ? member.roleCode === null : member.roleCode === roleFilter);
      const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter]);

  const openRoleDialog = (member: OrganizationMember) => {
    setEditingMember(member);
    setSelectedRole(member.roleCode ?? 'VT-03');
  };

  const saveRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMember) return;
    setMembers((current) => current.map((member) => member.id === editingMember.id
      ? { ...member, roleCode: selectedRole, roleName: roleNames[selectedRole] }
      : member));
    toast.success(`Đã cập nhật vai trò cho ${editingMember.fullName}`);
    setEditingMember(null);
  };

  const deactivateMember = (selectedMember: OrganizationMember) => {
  if (selectedMember.status === 'INACTIVE') return;

  setMembers((current) =>
    current.map((member) =>
      member.id === selectedMember.id
        ? { ...member, status: 'INACTIVE' }
        : member,
    ),
  );

  toast.success(`Đã vô hiệu hóa ${selectedMember.fullName}`);
};

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Quản lý truy cập
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Cấp quyền cho thành viên</h1>
            <p className="mt-2 text-sm text-slate-500">
              Gán hoặc thu vai trò của thành viên trong Hợp tác xã Phú Thịnh.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <ShieldCheck className="size-5 text-emerald-700" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">Phạm vi tổ chức</p>
              <p className="text-xs text-emerald-700">Đang thao tác với quyền VT-02</p>
            </div>
          </div>
        </header>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Thành viên tổ chức</CardTitle>
                <CardDescription className="mt-1">
                  Danh sách thành viên hiện tại của tổ chức gồm vai trò và trạng thái hoạt động của họ.
                </CardDescription>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {filteredMembers.length} kết quả
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 md:grid-cols-[1fr_220px_200px]">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="bg-white pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm tài khoản, họ tên, email hoặc số điện thoại..."
                  aria-label="Tìm kiếm thành viên"
                />
              </label>
              <select
                className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Lọc theo vai trò"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="VT-02">Quản lý hợp tác xã</option>
                <option value="VT-03">Người ghi sự kiện</option>
                <option value="NONE">Chưa cấp quyền</option>
              </select>
              <select
                className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Lọc theo trạng thái"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Đã vô hiệu hóa</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {['Tài khoản', 'Họ và tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Thao tác'].map((title) => (
                      <th className="px-4 py-3 font-semibold" key={title}>{title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const inactive = member.status === 'INACTIVE';
                    return (
                      <tr className={inactive ? 'border-t bg-slate-50 opacity-70' : 'border-t hover:bg-emerald-50/30'} key={member.id}>
                        <td className="px-4 py-4 font-semibold text-emerald-700">@{member.username}</td>
                        <td className="px-4 py-4 font-medium">{member.fullName}</td>
                        <td className="px-4 py-4 text-slate-600">{member.email ?? '—'}</td>
                        <td className="px-4 py-4 text-slate-600">{member.phone ?? '—'}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(member.roleCode)}`}
                          >
                            {member.roleName ?? 'Chưa cấp quyền'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            className={`group inline-flex h-8 items-center rounded-full border border-transparent px-1 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                inactive
                                ? 'cursor-default text-red-600 hover:border-red-200 hover:bg-red-50 hover:px-2.5'
                                : 'cursor-pointer text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 hover:px-2.5 focus-visible:ring-emerald-500'
                            }`}
                            onClick={() => deactivateMember(member)}
                            disabled={inactive}
                            aria-label={
                                inactive
                                ? `${member.fullName} đã bị vô hiệu hóa`
                                : `Vô hiệu hóa ${member.fullName}`
                            }
                            title={
                                inactive
                                ? 'Tài khoản đã bị vô hiệu hóa'
                                : 'Bấm để vô hiệu hóa'
                            }
                            >
                                <span
                              className={`size-2 shrink-0 rounded-full ${
                                inactive ? 'bg-red-500' : 'bg-emerald-600'
                              }`}
                            />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-28 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-28 group-focus-visible:opacity-100">
                              {inactive ? 'Đã vô hiệu hóa' : 'Đang hoạt động'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <Button size="sm" variant="outline" disabled={inactive} onClick={() => openRoleDialog(member)}>
                            {member.roleCode ? 'Đổi vai trò' : 'Cấp quyền'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filteredMembers.length && (
                <div className="grid place-items-center px-4 py-16 text-center">
                  <UserRoundCog className="mb-3 size-9 text-slate-300" />
                  <p className="font-semibold">Không tìm thấy thành viên</p>
                  <p className="mt-1 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl" onSubmit={saveRole}>
            <div className="flex justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">Cấp/đổi vai trò</h2>
                <p className="mt-1 text-sm text-slate-500">Chọn vai trò phù hợp với phần việc được giao.</p>
              </div>
              <button type="button" onClick={() => setEditingMember(null)} aria-label="Đóng"><X className="size-5" /></button>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold">Thành viên</p>
                <div className="rounded-lg border bg-slate-50 px-3 py-2">
                  <p className="font-semibold">{editingMember.fullName}</p>
                  <p className="text-xs text-slate-500">@{editingMember.username} · {editingMember.email}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Vai trò hiện tại</p>
                <div className="rounded-lg border bg-slate-50 px-3 py-3 text-sm">{editingMember.roleName ?? 'Chưa cấp quyền'}</div>
              </div>
              <label className="block text-sm font-semibold">
                Vai trò mới <span className="text-red-600">*</span>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as AssignableRoleCode)}
                >
                  <option value="VT-02">Quản lý hợp tác xã (VT-02)</option>
                  <option value="VT-03">Người ghi sự kiện (VT-03)</option>
                </select>
              </label>
              <p className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                {selectedRole === 'VT-02'
                  ? 'Quản lý dữ liệu và thành viên trong đúng phạm vi tổ chức.'
                  : 'Ghi nhật ký và sự kiện; không thể tự cấp quyền cho người khác.'}
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t p-5">
              <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>Hủy</Button>
              <Button type="submit">Lưu vai trò</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};