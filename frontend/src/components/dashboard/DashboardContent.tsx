import { useAuth } from '@/hooks/useAuth';

import { AdminDashboard } from './AdminDashboard';
import { CooperativeDashboard } from './CooperativeDashboard';
import { EventRecorderDashboard } from './EventRecorderDashboard';
import { BuyerDashboard } from './BuyerDashboard';
import { OfficerDashboard } from './OfficerDashboard';

export function DashboardContent() {
  const { user } = useAuth();

  switch (user?.roleCode) {
    case 'VT-01':
      return <AdminDashboard />;

    case 'VT-02':
      return <CooperativeDashboard />;

    case 'VT-03':
      return <EventRecorderDashboard />;

    case 'VT-04':
      return <BuyerDashboard />;

    case 'VT-05':
      return <OfficerDashboard />;

    default:
      return (
        <div className="rounded-lg border p-6">
          Không có Dashboard phù hợp với vai trò hiện tại.
        </div>
      );
  }
}