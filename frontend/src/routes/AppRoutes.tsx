import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';

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

const DashboardPage = () => <div>Dashboard (trang chủ)</div>;

const UnauthorizedPage = () => (
  <div>Bạn không có quyền truy cập trang này.</div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/organizations/profile"
        element={
          <PrivateRoute>
            <OrganizationProfilePage />
          </PrivateRoute>
        }
      />

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

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;