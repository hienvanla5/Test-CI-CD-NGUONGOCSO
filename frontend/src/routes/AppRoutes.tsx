import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { useAuth } from '../hooks/useAuth';
import { type UserInfo } from '../types/auth';
import OrganizationProfilePage from '@/pages/organization/OrganizationProfilePage';
import ProductionLotEditPage from '@/pages/farm/ProductionLotEditPage';

// Component bảo vệ route yêu cầu đăng nhập
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardPage = () => <div>Dashboard (trang chủ)</div>;

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

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
        path='/organizations/profile'
        element={
          <PrivateRoute>
            <OrganizationProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/production-lots/:id/edit"
        element={
          <PrivateRoute>
            <ProductionLotEditPage />
          </PrivateRoute>
        }
      />
      {/* Thêm các route khác sau */}
    </Routes>
  );
};

export default AppRoutes;