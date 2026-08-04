import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  assignMemberRole,
  getOrganizationMembers,
  getRoles,
} from "@/api/memberApi";
import type { OrganizationMember, RoleOption } from "@/types/member";
import { Search, ShieldCheck, UserRoundCog, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { ROLE_ACCESS } from "@/config/roleAccess";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPopup
} from "@/components/ui/alert-dialog";
import { getRoleLabel } from "@/config/roleAccess";

const roleBadgeClasses: Record<string, string> = {
  "VT-02": "bg-blue-100 text-blue-700",
  "VT-03": "bg-purple-100 text-purple-700",
  "VT-04": "bg-orange-100 text-orange-700",
};

const getRoleBadgeClass = (roleCode: string | null) => {
  if (!roleCode) return "bg-slate-100 text-slate-500";
  return roleBadgeClasses[roleCode] ?? "bg-amber-100 text-amber-700";
};

export const MemberList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = usePermission(ROLE_ACCESS.memberManagement);

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingMember, setPendingMember] = useState<OrganizationMember | null>(null);
  const [pendingRoleId, setPendingRoleId] = useState<number | null>(null);
  const [oldManager, setOldManager] = useState<OrganizationMember | null>(null); // 🆕 state quản lý cũ

  // Các vai trò được phép gán cho thành viên
const assignableRoles = useMemo(
  () =>
    roles.filter((role) =>
      ["VT-02", "VT-03", "VT-04"].includes(role.code),
    ),
  [roles],
);

  const selectedRole = roles.find(
    (role) => role.roleId === Number(selectedRoleId),
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [memberData, roleData] = await Promise.all([
          getOrganizationMembers(),
          getRoles(),
        ]);
        setMembers(memberData);
        setRoles(roleData);
      } catch {
        toast.error("Không thể tải danh sách thành viên");
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, []);

  // Tìm người đang giữ VT-02 (khác với userId được chỉ định)
  const findCurrentManager = (excludeUserId?: string) => {
    return members.find(
      (m) => m.roleCode === "VT-02" && m.userId !== excludeUserId,
    );
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return members.filter((member) => {
      if (user && member.userId === user.userId) return false;

      const matchesSearch =
        !keyword ||
        [
          member.username,
          member.fullName,
          member.email ?? "",
          member.phone ?? "",
        ].some((value) => value.toLowerCase().includes(keyword));
      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "NONE"
          ? member.roleCode === null
          : member.roleCode === roleFilter);
      const matchesStatus =
        statusFilter === "ALL" || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter, user]);

  const openRoleDialog = (member: OrganizationMember) => {
    setEditingMember(member);
    setSelectedRoleId(String(member.roleId));
    setOldManager(null); // reset khi mở dialog mới
  };

  const handleConfirmAssign = async () => {
    if (!pendingMember || !pendingRoleId) return;
    try {
      setIsSaving(true);
      const updatedMember = await assignMemberRole({
        userId: pendingMember.userId,
        roleId: pendingRoleId,
      });
      setMembers((current) =>
        current.map((member) =>
          member.id === updatedMember.id ? updatedMember : member,
        ),
      );
      toast.success(`Đã cập nhật vai trò cho ${pendingMember.fullName}`);
      setEditingMember(null);
      setPendingMember(null);
      setPendingRoleId(null);
      setOldManager(null);
    } catch {
      toast.error("Không thể cập nhật vai trò");
    } finally {
      setIsSaving(false);
      setConfirmDialogOpen(false);
    }
  };

  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMember || !selectedRoleId) return;

    const roleId = Number(selectedRoleId);
    const role = roles.find((r) => r.roleId === roleId);

    if (role?.code === "VT-02") {
      // Tìm quản lý hiện tại (trừ người được chọn)
      const currentManager = findCurrentManager(editingMember.userId);
      setOldManager(currentManager || null);
      setPendingMember(editingMember);
      setPendingRoleId(roleId);
      setConfirmDialogOpen(true);
      return;
    }

    // Gán trực tiếp cho VT-03
    try {
      setIsSaving(true);
      const updatedMember = await assignMemberRole({
        userId: editingMember.userId,
        roleId,
      });
      setMembers((current) =>
        current.map((member) =>
          member.id === updatedMember.id ? updatedMember : member,
        ),
      );
      toast.success(`Đã cập nhật vai trò cho ${editingMember.fullName}`);
      setEditingMember(null);
    } catch {
      toast.error("Không thể cập nhật vai trò");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Quản lý truy cập
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Cấp quyền cho thành viên
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Gán hoặc thu vai trò của thành viên trong tổ chức.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <ShieldCheck className="size-5 text-emerald-700" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">
                Phạm vi tổ chức
              </p>
              <p className="text-xs text-emerald-700">
                Đang thao tác với quyền {user?.roleCode}
              </p>
            </div>
          </div>
        </header>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Thành viên tổ chức</CardTitle>
                <CardDescription>
                  Danh sách thành viên hiện tại cùng vai trò và trạng thái.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {filteredMembers.length} kết quả
                </span>
                {canCreate && (
                  <Button size="sm" variant="create" onClick={() => navigate("/members/create")}>
                    Thêm thành viên
                  </Button>
                )}
              </div>
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
                  placeholder="Tìm kiếm thành viên..."
                />
              </label>
              <select
                className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
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
                    {[
                      "Tài khoản",
                      "Họ và tên",
                      "Email",
                      "Số điện thoại",
                      "Vai trò",
                      "Trạng thái",
                      "Thao tác",
                    ].map((title) => (
                      <th className="px-4 py-3 font-semibold" key={title}>
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td
                        className="px-4 py-10 text-center text-slate-500"
                        colSpan={7}
                      >
                        Đang tải danh sách thành viên...
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    filteredMembers.map((member) => {
                      const inactive = member.status === "INACTIVE";
                      return (
                        <tr
                          className={
                            inactive
                              ? "border-t bg-slate-50 opacity-70"
                              : "border-t hover:bg-emerald-50/30"
                          }
                          key={member.id}
                        >
                          <td className="px-4 py-4 font-semibold text-emerald-700">
                            @{member.username}
                          </td>
                          <td className="px-4 py-4 font-medium">
                            {member.fullName}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {member.email ?? "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {member.phone ?? "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(member.roleCode)}`}
                            >
                              {getRoleLabel(member.roleCode || '') ?? "Chưa cấp quyền"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                inactive
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span
                                className={`size-2 shrink-0 rounded-full ${
                                  inactive ? "bg-red-500" : "bg-emerald-600"
                                }`}
                              />
                              {inactive ? "Đã vô hiệu hóa" : "Đang hoạt động"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={inactive}
                              onClick={() => openRoleDialog(member)}
                            >
                              {member.roleCode ? "Đổi vai trò" : "Cấp quyền"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {!isLoading && !filteredMembers.length && (
                <div className="grid place-items-center px-4 py-16 text-center">
                  <UserRoundCog className="mb-3 size-9 text-slate-300" />
                  <p className="font-semibold">Không tìm thấy thành viên</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thử thay đổi từ khóa hoặc bộ lọc.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <form
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
            onSubmit={saveRole}
          >
            <div className="flex justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">Cấp/đổi vai trò</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn vai trò phù hợp với phần việc được giao.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                aria-label="Đóng"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold">Thành viên</p>
                <div className="rounded-lg border bg-slate-50 px-3 py-2">
                  <p className="font-semibold">{editingMember.fullName}</p>
                  <p className="text-xs text-slate-500">
                    @{editingMember.username}
                    {editingMember.email ? ` · ${editingMember.email}` : ""}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Vai trò hiện tại</p>
                <div className="rounded-lg border bg-slate-50 px-3 py-3 text-sm">
                  {getRoleLabel(editingMember.roleCode || '') ?? "Chưa cấp quyền"}
                </div>
              </div>
              <label className="block text-sm font-semibold">
                Vai trò mới <span className="text-red-600">*</span>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
                  value={selectedRoleId}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                  required
                >
                  <option value="">Chọn vai trò</option>
                  {assignableRoles.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {getRoleLabel(role.code)} ({role.code})
                    </option>
                  ))}
                </select>
              </label>
              <p className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                {selectedRole?.code === "VT-02"
                  ? "Quản lý dữ liệu và thành viên trong đúng phạm vi tổ chức."
                  : "Ghi nhật ký và sự kiện; không thể tự cấp quyền cho người khác."}
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t p-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMember(null)}
              >
                Hủy
              </Button>
              <Button type="submit" variant="create" disabled={isSaving || !selectedRoleId}>
                {isSaving ? "Đang lưu..." : "Lưu vai trò"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cấp quyền Quản lý HTX</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc chắn muốn cấp quyền{" "}
                <strong>Quản lý hợp tác xã (VT-02)</strong> cho{" "}
                <strong>{pendingMember?.fullName}</strong>?
              </p>
              {oldManager && (
                <p className="text-amber-700">
                  <strong>Lưu ý:</strong> Quản lý hiện tại <strong>{oldManager.fullName}</strong> sẽ tự động bị hạ xuống <strong>Người ghi sự kiện (VT-03)</strong>.
                </p>
              )}
              <p className="text-slate-600">
                Người này sẽ có toàn quyền quản lý thành viên và dữ liệu trong tổ chức.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAssign}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Xác nhận cấp quyền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
};