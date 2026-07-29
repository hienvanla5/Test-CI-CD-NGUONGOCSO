import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';

import ProductionLotEditPage from '@/pages/farm/ProductionLotEditPage';
import { CreateFarmAreaPage } from '@/pages/farm-area/CreateFarmAreaPage';
import { CreateOrganizationPage } from '@/pages/organization/CreateOrganizationPage';
import MemberPermissionsPage from '@/pages/organization/MemberPermissionsPage';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';

// Bảo vệ route yêu cầu đăng nhập
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

// Chỉ cho Quản lý hợp tác xã VT-02 truy cập
const CooperativeManagerRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleCode !== 'VT-02') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Chỉ cho Quản trị hệ thống VT-01 truy cập
const AdminRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleCode !== 'VT-01') {
    return <Navigate to="/" replace />;
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
        Màn hình này chỉ dành cho Quản lý hợp tác xã (VT-02).
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
            <CooperativeManagerRoute>
              <MemberPermissionsPage />
            </CooperativeManagerRoute>
          </PrivateRoute>
        }
      />

      {/* Tạo tổ chức — VT-01 */}
      <Route
        path="/organizations/create"
        element={
          <AdminRoute>
            <CreateOrganizationPage />
          </AdminRoute>
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