import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import { useAuth } from "../hooks/useAuth";
import OrganizationProfilePage from "@/pages/organization/OrganizationProfilePage";
import { CreateOrganizationPage } from "@/pages/organization/CreateOrganizationPage";
import { CreateFarmAreaPage } from "@/pages/farm-area/CreateFarmAreaPage";

import ProductionLotEditPage from "@/pages/farm/ProductionLotEditPage";
import CreateCodeRangePage from "@/pages/admin/CreateCodeRangePage";
import CodeRangeListPage from "@/pages/admin/CodeRangeListPage";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";

// Component bảo vệ route yêu cầu đăng nhập
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Component bảo vệ yêu cầu quyền admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.roleCode !== "VT-01") return <Navigate to="/" replace />;
  return <>{children}</>;
};
const DashboardPage = () => <div>Dashboard (trang chủ)</div>;

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
        path="/organizations/create"
        element={
          <AdminRoute>
            <CreateOrganizationPage />
          </AdminRoute>
        }
      />
      <Route
        path="/farm-areas/create"
        element={
          <PrivateRoute>
            <CreateFarmAreaPage />
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
      <Route
        path="/admin/code-ranges"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["VT-01"]}>
              <CodeRangeListPage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/code-ranges/create"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={["VT-01"]}>
              <CreateCodeRangePage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      {/* Thêm các route khác sau */}
    </Routes>
  );
};

export default AppRoutes;
