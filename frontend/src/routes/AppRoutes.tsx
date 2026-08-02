import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import {
  AUTHENTICATED_ROLE_CODES,
  ROLE_ACCESS,
  hasAnyRole,
  type AuthenticatedRoleCode,
} from "@/config/roleAccess";
import { useAuth } from "@/hooks/useAuth";

import LoginPage from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/daskboard/DashboardPase";
import { CreateFarmAreaPage } from "@/pages/farm-area/CreateFarmAreaPage";
import CreateFarmLogPage from "@/pages/farm-log/CreateFarmLogPage";
import ProductionLotEditPage from "@/pages/farm/ProductionLotEditPage";
import { CreateOrganizationPage } from "@/pages/organization/CreateOrganizationPage";
import MemberPermissionsPage from "@/pages/organization/MemberPermissionsPage";
import OrganizationProfilePage from "@/pages/organization/OrganizationProfilePage";
import CreateProductionLotPage from "@/pages/production-lot/CreateProductionLotPage";
import ProductionLotListPage from "@/pages/production-lot/ProductionLotListPage";
import RecordTransportEventPage from "@/pages/transport-event/RecordTransportEventPage";

import CreateCodeRangePage from "@/pages/admin/CreateCodeRangePage";
import CodeRangeListPage from "@/pages/admin/CodeRangeListPage";
import ProductCategoryManagementPage from "@/pages/admin/ProductCategoryManagementPage";
import StandardManagementPage from "@/pages/admin/StandardManagementPage";
import CreatePackagingEventPage from "@/pages/packaging-event/CreatePackagingEventPage";
import CorrectPackagingEventPage from "@/pages/packaging-event/CorrectPackagingEventPage";

import { OrganizationListPage } from "@/pages/organization/OrganizationListPage";
import CreateMemberPage from "@/pages/organization/CreateMemberPage";
import FarmLogHistoryPage from "@/pages/farm-log/FarmLogHistoryPage";

import { ProductionLotDetailPage } from "@/pages/shipment/ProductionLotDetailPage";

import TraceLookupPage from "@/pages/public/TraceLookupPage";

import LookupStatisticsPage from "@/pages/report/LookupStatisticsPage";
import ActivityLogPage from "@/pages/report/ActivityLogPage";
import FailedEventLogsPage from "@/pages/report/FailedEventLogsPage";
import CropAreaAnalysisPage from "@/pages/report/CropAreaAnalysisPage";
import IndustryReportPage from "@/pages/report/IndustryReportPage";

import ScanAnomalyAlertPage from "@/pages/scan-anomaly-alert/ScanAnomalyAlertPage";

import FarmAreaListPage from "@/pages/farm-area/FarmAreaListPage";

import RecordMobileEventPage from "@/pages/mobile/RecordMobileEventPage";
import CreateCertificationPage from "@/pages/certification/CreateCertificationPage";
import CertificationListPage from "@/pages/certification/CertificationListPage";

import ProcurementEventPage from "@/pages/procurement-event/procurement-event";

const COOPERATIVE_MANAGER_ROLES = [
  "VT-02",
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
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<DashboardPage />} />

      <Route
        path="organizations/profile"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.organizationProfile}>
            <OrganizationProfilePage />
          </RoleRoute>
        }
      />
      <Route
        path="organizations/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.organizationCreate}>
            <CreateOrganizationPage />
          </RoleRoute>
        }
      />
      <Route
        path="organizations"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.organizationList}>
            <OrganizationListPage />
          </RoleRoute>
        }
      />

      <Route
        path="members"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <MemberPermissionsPage />
          </RoleRoute>
        }
      />
      <Route
        path="members/create"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <CreateMemberPage />
          </RoleRoute>
        }
      />

      <Route
        path="farm-areas/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.farmAreaCreate}>
            <CreateFarmAreaPage />
          </RoleRoute>
        }
      />
      <Route
        path="farm-areas"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <FarmAreaListPage />
          </RoleRoute>
        }
      />

      <Route
        path="production-lots"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.productionLotList}>
            <ProductionLotListPage />
          </RoleRoute>
        }
      />
      <Route
        path="production-lots/create"
        element={
          <RoleRoute allowedRoles={COOPERATIVE_MANAGER_ROLES}>
            <CreateProductionLotPage />
          </RoleRoute>
        }
      />
      <Route
        path="production-lots/:id/edit"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.productionLotEdit}>
            <ProductionLotEditPage />
          </RoleRoute>
        }
      />
      <Route
        path="production-lots/:id"
        element={
          <RoleRoute allowedRoles={["VT-01", "VT-02", "VT-03"]}>
            <ProductionLotDetailPage />
          </RoleRoute>
        }
      />

      <Route
        path="farm-logs/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.farmLogCreate}>
            <CreateFarmLogPage />
          </RoleRoute>
        }
      />
      <Route
        path="production-lots/:productionLotId/farm-logs"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <FarmLogHistoryPage />
          </RoleRoute>
        }
      />

      <Route
        path="packaging-events/create"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.packagingEventCreate}>
            <CreatePackagingEventPage />
          </RoleRoute>
        }
      />
      <Route
        path="packaging-events/:id/correct"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.packagingEventCorrect}>
            <CorrectPackagingEventPage />
          </RoleRoute>
        }
      />

      <Route
        path="transport-events/record"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.transportEventRecord}>
            <RecordTransportEventPage />
          </RoleRoute>
        }
      />

      <Route
        path="admin/code-ranges"
        element={
          <RoleRoute allowedRoles={["VT-01"]}>
            <CodeRangeListPage />
          </RoleRoute>
        }
      />
      <Route
        path="admin/code-ranges/create"
        element={
          <RoleRoute allowedRoles={["VT-01"]}>
            <CreateCodeRangePage />
          </RoleRoute>
        }
      />

      <Route
        path="admin/product-categories"
        element={
          <RoleRoute allowedRoles={["VT-01"]}>
            <ProductCategoryManagementPage />
          </RoleRoute>
        }
      />

      <Route
        path="admin/standards"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.standardManagement}>
            <StandardManagementPage />
          </RoleRoute>
        }
      />

      <Route
        path="mobile/record-event"
        element={
          <RoleRoute allowedRoles={["VT-02", "VT-03"]}>
            <RecordMobileEventPage />
          </RoleRoute>
        }
      />

      <Route
        path="reports/lookup-statistics"
        element={
          <RoleRoute allowedRoles={["VT-01", "VT-02"]}>
            <LookupStatisticsPage />
          </RoleRoute>
        }
      />
      <Route
        path="activity-logs"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <ActivityLogPage />
          </RoleRoute>
        }
      />
      <Route
        path="failed-event-logs"
        element={
          <RoleRoute allowedRoles={["VT-02", "VT-03"]}>
            <FailedEventLogsPage />
          </RoleRoute>
        }
      />
      <Route
        path="reports/crop-area-analysis"
        element={
          <RoleRoute allowedRoles={["VT-01", "VT-05"]}>
            <CropAreaAnalysisPage />
          </RoleRoute>
        }
      />
      <Route
        path="reports/industry"
        element={
          <RoleRoute allowedRoles={["VT-05"]}>
            <IndustryReportPage />
          </RoleRoute>
        }
      />

      <Route
        path="procurement-event"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.procurementEvent}>
            <ProcurementEventPage />
          </RoleRoute>
        }
      />

      <Route
        path="alerts/scan-anomaly"
        element={
          <RoleRoute allowedRoles={ROLE_ACCESS.scanAnomalyAlerts}>
            <ScanAnomalyAlertPage />
          </RoleRoute>
        }
      />

      <Route
        path="certifications"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <CertificationListPage />
          </RoleRoute>
        }
      />
      <Route
        path="certifications/create"
        element={
          <RoleRoute allowedRoles={["VT-02"]}>
            <CreateCertificationPage />
          </RoleRoute>
        }
      />

      <Route path="unauthorized" element={<UnauthorizedPage />} />
    </Route>

    <Route path="/public/trace/:codeValue" element={<TraceLookupPage />} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;