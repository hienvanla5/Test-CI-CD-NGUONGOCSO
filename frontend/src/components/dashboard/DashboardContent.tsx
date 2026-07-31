import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

import { AdminDashboard } from './AdminDashboard';
import { CooperativeDashboard } from './CooperativeDashboard';

export function DashboardContent() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  switch (user?.roleCode) {
    case 'VT-01':
      return <AdminDashboard initialTab={tab} />;
    case 'VT-02':
      return <CooperativeDashboard initialTab={tab} />;
    default:
      return (
        <div className="rounded-lg border bg-white p-6">
          Không có Dashboard phù hợp với vai trò hiện tại.
        </div>
      );
  }
}