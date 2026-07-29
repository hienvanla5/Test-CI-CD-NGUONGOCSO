import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/daskboard/DashboardPase';
import { CreateFarmAreaPage } from '@/pages/farm-area/CreateFarmAreaPage';
import ProductionLotEditPage from '@/pages/farm/ProductionLotEditPage';
import { CreateOrganizationPage } from '@/pages/organization/CreateOrganizationPage';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Đang tải...
    </div>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roleCode !== 'VT-01') return <Navigate to="/" replace />;

  return children;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="organizations/profile" element={<OrganizationProfilePage />} />
      <Route
        path="organizations/create"
        element={
          <AdminRoute>
            <CreateOrganizationPage />
          </AdminRoute>
        }
      />
      <Route path="farm-areas/create" element={<CreateFarmAreaPage />} />
      <Route path="production-lots/:id/edit" element={<ProductionLotEditPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;