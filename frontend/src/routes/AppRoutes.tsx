import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';

import ProductionLotEditPage from '@/pages/farm/ProductionLotEditPage';
import { CreateFarmAreaPage } from '@/pages/farm-area/CreateFarmAreaPage';
import { CreateOrganizationPage } from '@/pages/organization/CreateOrganizationPage';
import MemberPermissionsPage from '@/pages/organization/MemberPermissionsPage';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';
import CreateProductionLotPage from '@/pages/production-lot/CreateProductionLotPage';
import RoleRoute from './RoleRoute';

// Bảo vệ những route yêu cầu đăng nhập
const PrivateRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardPage = () => (
  <div>Dashboard (trang chủ)</div>
);

const UnauthorizedPage = () => (
  <main className="grid min-h-screen place-items-center p-6 text-center">
    <div>
      <h1 className="text-2xl font-bold">
        Bạn không có quyền truy cập
      </h1>

      <p className="mt-2 text-slate-500">
        Tài khoản của bạn không được phép truy cập màn hình này.
      </p>
    </div>
  </main>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Đăng nhập */}
      <Route path="/login" element={<LoginPage />} />

      {/* Trang chủ */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Hồ sơ tổ chức */}
      <Route
        path="/organizations/profile"
        element={
          <PrivateRoute>
            <OrganizationProfilePage />
          </PrivateRoute>
        }
      />

      {/* Cấp quyền thành viên — VT-02 */}
      <Route
        path="/organizations/members"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['VT-02']}>
              <MemberPermissionsPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Tạo tổ chức — VT-01 */}
      <Route
        path="/organizations/create"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['VT-01']}>
              <CreateOrganizationPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Tạo vùng trồng */}
      <Route
        path="/farm-areas/create"
        element={
          <PrivateRoute>
            <CreateFarmAreaPage />
          </PrivateRoute>
        }
      />

      {/* Tạo lô sản xuất — VT-02 */}
      <Route
        path="/production-lots/create"
        element={
          <PrivateRoute>
            <RoleRoute allowedRoles={['VT-02']}>
              <CreateProductionLotPage />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Chỉnh sửa lô sản xuất */}
      <Route
        path="/production-lots/:id/edit"
        element={
          <PrivateRoute>
            <ProductionLotEditPage />
          </PrivateRoute>
        }
      />

      {/* Không có quyền */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* Đường dẫn không tồn tại */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;