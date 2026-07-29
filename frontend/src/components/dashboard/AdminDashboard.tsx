import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Organization } from '@/types/organization';
import { getOrganizations } from '@/api/organizationApi';

export function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await getOrganizations();
        setOrganizations(data);
      } catch {
        toast.error('Không thể tải danh sách tổ chức');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrganizations();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>

      {/* Bảng danh sách tổ chức đặt tại đây */}
    </div>
  );
}