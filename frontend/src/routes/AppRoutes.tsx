import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';
import { type UserInfo } from '../types/auth';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';
import MemberPermissionsPage from '@/pages/organization/MemberPermissionsPage';

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

  if (user?.roleCode !== 'VT-02') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const DashboardPage = () => {
  return <div>Dashboard (trang chủ)</div>;
};

const UnauthorizedPage = () => {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">
          Bạn không có quyền truy cập
        </h1>

        <p className="mt-2 text-slate-500">
          Màn hình cấp quyền chỉ dành cho Quản lý hợp tác xã (VT-02).
        </p>
      </div>
    </main>
  );
};

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

      {/* Cấp quyền cho thành viên */}
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

      {/* Trang không có quyền */}
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