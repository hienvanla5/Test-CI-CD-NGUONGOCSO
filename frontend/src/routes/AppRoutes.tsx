import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from '@/components/layout/MainLayout';
import {
  AUTHENTICATED_ROLE_CODES,
  ROLE_ACCESS,
  hasAnyRole,
  type AuthenticatedRoleCode,
} from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/daskboard/DashboardPase';
import { CreateFarmAreaPage } from '@/pages/farm-area/CreateFarmAreaPage';
import ProductionLotEditPage from '@/pages/farm/ProductionLotEditPage';
import { CreateOrganizationPage } from '@/pages/organization/CreateOrganizationPage';
import MemberPermissionsPage from '@/pages/organization/MemberPermissionsPage';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';

const COOPERATIVE_MANAGER_ROLES = [
  'VT-02',
] as const satisfies readonly AuthenticatedRoleCode[];

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

  // VT-06 chỉ tra cứu công khai, không sử dụng khu vực quản trị nội bộ.
  if (!hasAnyRole(user.roleCode, AUTHENTICATED_ROLE_CODES)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: readonly AuthenticatedRoleCode[];
}

function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (!hasAnyRole(user.roleCode, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function UnauthorizedPage() {
  return (
    <main className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-muted-foreground">
          Tài khoản hiện tại không được cấp quyền sử dụng chức năng này.
        </p>
      </div>
    </main>
  );
}

const AppRoutes = () => (
  <Routes>
    {/* Route công khai */}
    <Route path="/login" element={<LoginPage />} />

    {/* Toàn bộ route nội bộ dùng chung Header + Sidebar + Outlet */}
    <Route
      element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }
    >
      {/* Dashboard thật, không dùng component tạm */}
      <Route index element={<DashboardPage />} />

      {/* Tạo tổ chức — VT-01 */}
      <Route
        path="organizations/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.organizationCreate}>
            <CreateOrganizationPage />
          </RoleRoute>
        }
      />

      {/* Hồ sơ tổ chức — VT-01, VT-02 */}
      <Route
        path="organizations/profile"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.organizationProfile}>
            <OrganizationProfilePage />
          </RoleRoute>
        }
      />

      {/* Cấp quyền thành viên — giữ nguyên chức năng mới từ develop, chỉ VT-02 */}
      <Route
        path="organizations/members"
        element={
          <RoleRoute allowedRoles={COOPERATIVE_MANAGER_ROLES}>
            <MemberPermissionsPage />
          </RoleRoute>
        }
      />

      {/* Tạo vùng trồng — VT-02 */}
      <Route
        path="farm-areas/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.farmAreaCreate}>
            <CreateFarmAreaPage />
          </RoleRoute>
        }
      />

      {/* Chỉnh sửa lô sản xuất — VT-02 */}
      <Route
        path="production-lots/:id/edit"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.productionLotEdit}>
            <ProductionLotEditPage />
          </RoleRoute>
        }
      />

      {/* Trang báo không đủ quyền vẫn nằm trong layout */}
      <Route path="unauthorized" element={<UnauthorizedPage />} />
    </Route>

    {/* Route không tồn tại */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;