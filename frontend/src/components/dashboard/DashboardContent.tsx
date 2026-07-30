import { useAuth } from '@/hooks/useAuth';

import { AdminDashboard } from './AdminDashboard';
import { CooperativeDashboard } from './CooperativeDashboard';

export function DashboardContent() {
  const { user } = useAuth();

  switch (user?.roleCode) {
    case 'VT-01':
      return <AdminDashboard />;

    case 'VT-02':
      return <CooperativeDashboard />;

    //phát triển các dashboard khác bằng cách return tại đây

    default:
      return (
        <div className="rounded-lg border p-6">
          Không có Dashboard phù hợp với vai trò hiện tại.
        </div>
      );
  }
}