import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ActivityLog } from '@/types/activityLog';

interface Props {
  logs: ActivityLog[];
  loading?: boolean;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  APPROVE: 'bg-emerald-100 text-emerald-800',
  REJECT: 'bg-rose-100 text-rose-800',
  ACTIVATE: 'bg-purple-100 text-purple-800',
  RECALL: 'bg-orange-100 text-orange-800',
  EXPORT: 'bg-cyan-100 text-cyan-800',
  LOGIN: 'bg-slate-100 text-slate-800',
  LOGOUT: 'bg-slate-100 text-slate-800',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  APPROVE: 'Phê duyệt',
  REJECT: 'Từ chối',
  ACTIVATE: 'Kích hoạt',
  RECALL: 'Thu hồi',
  EXPORT: 'Xuất hồ sơ',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ActivityLogTable = ({ logs, loading }: Props) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-semibold">Chưa có hoạt động</p>
        <p className="text-sm">Chưa có thao tác nào được ghi nhận trong hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Người thực hiện</TableHead>
            <TableHead>Thao tác</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Đối tượng</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-sm">
                {formatDate(log.createdAt)}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{log.fullName}</div>
                  <div className="text-xs text-muted-foreground">@{log.username}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                  {ACTION_LABELS[log.action] || log.action}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <span className="truncate block">{log.description}</span>
              </TableCell>
              <TableCell>
                {log.entityType && (
                  <div>
                    <span className="text-xs text-muted-foreground">{log.entityType}</span>
                    {log.entityId && (
                      <div className="text-xs font-mono text-muted-foreground truncate max-w-[80px]">
                        {log.entityId}
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-xs font-mono">{log.ipAddress || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};