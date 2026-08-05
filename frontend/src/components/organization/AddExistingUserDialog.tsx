import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getAvailableUsers, addExistingUser } from '@/api/organizationApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { AvailableUser } from '@/types/organization';

interface AddExistingUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: () => void;
  availableRoles?: { id: number; code: string; name: string }[];
}

export function AddExistingUserDialog({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
  availableRoles = [],
}: AddExistingUserDialogProps) {
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await getAvailableUsers(organizationId);
      setUsers(response);
    } catch (error) {
      toast.error('Không thể tải danh sách user có sẵn');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userId: string) => {
    try {
      setSubmitting(userId);
      const roleId = selectedRole[userId] || undefined;
      await addExistingUser(organizationId, { userId, roleId });
      toast.success('Thêm user thành công');
      onSuccess();
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thêm user thất bại');
    } finally {
      setSubmitting(null);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Thêm tài khoản đã tồn tại</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có user nào có sẵn để thêm.
            <br />
            <span className="text-sm">(Các user đã có trong tổ chức cùng loại nhưng chưa có trong tổ chức này)</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò hiện tại</TableHead>
                <TableHead>Chọn vai trò mới</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.currentRoleCode} - {user.currentRoleName}</Badge>
                  </TableCell>
                  <TableCell>
                    {availableRoles.length > 0 ? (
                      <Select
                        value={selectedRole[user.userId] ? String(selectedRole[user.userId]) : ''}
                        onValueChange={(val) => {
                          setSelectedRole(prev => ({
                            ...prev,
                            [user.userId]: Number(val),
                          }));
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Giữ nguyên" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                              {role.code} - {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">Không thể đổi role</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAddUser(user.userId)}
                      disabled={submitting === user.userId}
                    >
                      {submitting === user.userId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Thêm'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}