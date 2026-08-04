import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Building2,
  FileText,
  FileUp,
  Hash,
  History,
  Layers,
  LayoutDashboard,
  MapPinned,
  Package,
  ScanLine,
  Shield,
  Truck,
  UserCheck,
  Users,
  X,
  TrendingUp,        // mới: báo cáo ngành
  Activity,         // mới: phân tích vùng trồng
  GitCompare,       // mới: so sánh mùa vụ
  PieChart,         // mới: thống kê tra cứu
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  ROLE_ACCESS,
  hasAnyRole,
  type AuthenticatedRoleCode,
} from "@/config/roleAccess";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  allowedRoles: readonly AuthenticatedRoleCode[];
  activePaths?: string[];
}

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // ── Tổng quan ──────────────────────────
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    href: "/dashboard",
    allowedRoles: ROLE_ACCESS.dashboard,
  },

  // ── Quản lý ──────────────────────────
  {
    icon: <Building2 className="h-5 w-5" />,
    label: "Tổ chức",
    href: "/organizations",
    allowedRoles: ROLE_ACCESS.organizationList,
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Quản lý thành viên",
    href: "/members",
    allowedRoles: ROLE_ACCESS.memberManagement,
  },
  {
    icon: <Layers className="h-5 w-5" />,
    label: "Danh mục nông sản",
    href: "/admin/product-categories",
    allowedRoles: ["VT-01"] as const,
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Tiêu chuẩn chất lượng",
    href: "/admin/standards",
    allowedRoles: ROLE_ACCESS.standardManagement,
  },
  {
    icon: <Award className="h-5 w-5" />,
    label: "Chứng nhận",
    href: "/certifications",
    allowedRoles: ["VT-02"] as const,
  },
  {
    icon: <Hash className="h-5 w-5" />,
    label: "Quản lý dải mã",
    href: "/admin/code-ranges",
    allowedRoles: ROLE_ACCESS.codeRangeList,
  },

  // ── Vận hành sản xuất ─────────────────
  {
    icon: <MapPinned className="h-5 w-5" />,
    label: "Vùng trồng",
    href: "/farm-areas",
    allowedRoles: ["VT-02"] as const,
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Lô sản xuất",
    href: "/production-lots",
    allowedRoles: ROLE_ACCESS.productionLotList,
    activePaths: ["/production-lots", "/packaging-events/create"],
  },
  {
    icon: <FileUp className="h-5 w-5" />,
    label: "Nhập lô hàng loạt",
    href: "/production-lots/import",
    allowedRoles: ["VT-02"],
  },
  {
    icon: <Truck className="h-5 w-5" />,
    label: "Ghi sự kiện vận chuyển",
    href: "/transport-events/record",
    allowedRoles: ROLE_ACCESS.transportEventRecord,
  },
  {
    icon: <ScanLine className="h-5 w-5" />,
    label: "Quét mã ghi sự kiện nhanh",
    href: "/chain-events/scan",
    allowedRoles: ROLE_ACCESS.scanQuickEvent,
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Nhật ký lỗi sự kiện",
    href: "/failed-event-logs",
    allowedRoles: ["VT-02", "VT-03"] as const,
  },

  // ── Thống kê & Báo cáo ────────────────
  {
    icon: <PieChart className="h-5 w-5" />,           // ✅ icon riêng
    label: "Thống kê tra cứu",
    href: "/reports/lookup-statistics",
    allowedRoles: ["VT-01", "VT-02"] as const,
  },
  {
    icon: <Activity className="h-5 w-5" />,           // ✅ icon riêng
    label: "Phân tích vùng trồng",
    href: "/reports/crop-area-analysis",
    allowedRoles: ["VT-01", "VT-05"] as const,
  },
  {
    icon: <GitCompare className="h-5 w-5" />,         // ✅ icon riêng
    label: "So sánh mùa vụ",
    href: "/reports/season-yield-comparison",
    allowedRoles: ROLE_ACCESS.seasonYieldComparison,
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,         // ✅ icon riêng
    label: "Báo cáo ngành",
    href: "/reports/industry",
    allowedRoles: ["VT-05"] as const,
  },
  {
    icon: <FileText className="h-5 w-5" />,           // giữ nguyên (đã dùng FileText)
    label: "Xuất dữ liệu mở",
    href: "/export/open-data",
    allowedRoles: ["VT-05"] as const,
  },

  // ── Hệ thống ──────────────────────────
  {
    icon: <History className="h-5 w-5" />,
    label: "Lịch sử hoạt động",
    href: "/activity-logs",
    allowedRoles: ["VT-02"] as const,
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: "Phân quyền",
    href: "/permissions/config",
    allowedRoles: ["VT-02"] as const,
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    label: "Hồ sơ tổ chức",
    href: "/organizations/profile",
    allowedRoles: ROLE_ACCESS.organizationProfile,
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Thông báo",
    href: "/notifications",
    allowedRoles: ["VT-01", "VT-02", "VT-03", "VT-04", "VT-05"] as const,
  },
];

export function Sidebar({
  onNavigate,
  onClose,
  showCloseButton = false,
}: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const visibleItems = MENU_ITEMS.filter((item) => {
    const hasAccess = hasAnyRole(user?.roleCode, item.allowedRoles);
    return hasAccess;
  });

  const finalItems =
    visibleItems.length === 0
      ? MENU_ITEMS.filter(
          (item) =>
            item.href === "/dashboard" || item.href === "/production-lots",
        )
      : visibleItems;

  const isActive = (item: MenuItem) => {
    const matchedItems = finalItems.filter((menuItem) => {
      const paths = menuItem.activePaths
        ? [menuItem.href, ...menuItem.activePaths]
        : [menuItem.href];
      return paths.some((path) => location.pathname.startsWith(path));
    });
    if (matchedItems.length === 0) return false;
    const longestMatch = matchedItems.reduce((a, b) =>
      a.href.length > b.href.length ? a : b
    );
    return longestMatch.href === item.href;
  };

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-emerald-100 bg-white/90 backdrop-blur-sm">
      {/* Logo area */}
      <div className="flex h-16 items-center border-b border-emerald-100 px-5">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center"
        >
          <Logo height={40} />
        </Link>
        {showCloseButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng menu"
            className="text-muted-foreground hover:text-emerald-700"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {finalItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700",
              )}
            >
              <span className={cn(active ? "text-white" : "text-emerald-500")}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        {finalItems.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            Không có menu
          </p>
        )}
      </nav>
    </aside>
  );
}