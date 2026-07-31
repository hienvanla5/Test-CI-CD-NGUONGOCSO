import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Organization } from '@/types/organization';
import { getOrganizations } from '@/api/organizationApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Calendar } from 'lucide-react';

export function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrganizations();
        console.log('✅ Dữ liệu tổ chức:', data);
        // Log sample để xem các trường có sẵn
        if (data.length > 0) {
          console.log('📋 Sample keys:', Object.keys(data[0]));
        }
        setOrganizations(data);
      } catch (err: any) {
        console.error('❌ Lỗi tải tổ chức:', err);
        setError(err.message || 'Không thể tải danh sách tổ chức');
        toast.error('Không thể tải danh sách tổ chức');
      } finally {
        setIsLoading(false);
      }
    };
    void loadOrganizations();
  }, []);

  // Helper lấy giá trị an toàn
  const getValue = (obj: any, keys: string[]): string => {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return String(obj[key]);
      }
    }
    return '—';
  };

  // Helper lấy ngày tạo
  const getCreatedDate = (obj: any): string => {
    const dateStr = obj.createdAt || obj.createdDate || obj.created_at;
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return '—';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-semibold">Không thể tải dữ liệu</p>
        <p className="text-sm">{error}</p>
        <button
          className="mt-3 text-sm underline"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Tổng số: {organizations.length} tổ chức</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tổ chức</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên tổ chức</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2">Chưa có tổ chức nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org, index) => (
                    <TableRow key={org.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{org.id}</TableCell>
                      <TableCell className="font-medium">
                        {getValue(org, ['name', 'organizationName', 'organization_name'])}
                      </TableCell>
                      <TableCell>
                        {getValue(org, ['code', 'organizationCode', 'organization_code'])}
                      </TableCell>
                      <TableCell>
                        {getValue(org, ['type', 'organizationType', 'organization_type'])}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            org.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : org.status === 'INACTIVE'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {org.status || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {getCreatedDate(org)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}