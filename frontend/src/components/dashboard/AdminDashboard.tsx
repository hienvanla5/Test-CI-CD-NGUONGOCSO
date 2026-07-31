// src/components/dashboard/AdminDashboard.tsx – Bảng điều khiển sản lượng và lô (VT-01)
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getProductionLotDashboard, type DashboardResponse } from '@/api/productionLotApi';
import { getOrganizations } from '@/api/organizationApi';
import { ProductionStatistics } from '@/components/dashboard/PoductionStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationListPage } from '@/pages/organization/OrganizationListPage';
import type { Organization } from '@/types/organization';

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    getOrganizations()
      .then((data) => {
        // Response thật từ backend dùng field organizationID/organizationName
        // (không khớp trực tiếp với type Organization khai báo phía FE) —
        // ánh xạ lại giống cách OrganizationListPage đang xử lý để tránh
        // dropdown hiển thị giá trị rỗng.
        const mapped = (data as any[]).map((item) => ({
          id: item.id ?? item.organizationID,
          name: item.name ?? item.organizationName,
          code: item.code ?? item.organizationCode,
          type: item.type ?? item.organizationType,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) as Organization[];
        setOrganizations(mapped);
      })
      .catch(() => {
        // Không chặn Dashboard nếu tải danh sách tổ chức thất bại —
        // VT-01 vẫn xem được dữ liệu mặc định.
        toast.error('Không thể tải danh sách tổ chức để lọc.');
      });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getProductionLotDashboard(
          selectedOrgId ? { organizationId: selectedOrgId } : undefined,
        );
        setDashboardData(data);
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error('Bạn không có quyền xem dữ liệu tổ chức này');
        } else {
          toast.error('Không thể tải dữ liệu');
        }
        setDashboardData(null);
      } finally {
        setIsLoading(false);
      }
    };
    void loadData();
  }, [selectedOrgId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng điều khiển sản lượng</CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm font-medium" htmlFor="admin-dashboard-org">
                Tổ chức:
              </label>
              <select
                id="admin-dashboard-org"
                className="rounded-md border px-3 py-1.5 text-sm"
                value={selectedOrgId}
                onChange={(event) => setSelectedOrgId(event.target.value)}
              >
                <option value="">Mặc định (tổ chức của tôi)</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <ProductionStatistics data={dashboardData} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Danh sách tổ chức — dùng lại trang có sẵn, không viết lại bảng */}
      <OrganizationListPage />
    </div>
  );
}