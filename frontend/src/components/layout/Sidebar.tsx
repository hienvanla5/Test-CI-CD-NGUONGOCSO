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
  TrendingUp,
  Activity,
  GitCompare,
  PieChart,
  Smartphone,
  Database,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  allowedRoles: readonly AuthenticatedRoleCode[];
  activePaths?: string[];
}

interface SidebarProps {
  /** Called when any navigation link is clicked. Used in mobile drawer. */
  onNavigate?: () => void;
  /** Called when the close button is clicked. Used in mobile drawer. */
  onClose?: () => void;
  /** Show close button (X) at top right. Used in mobile drawer. */
  showCloseButton?: boolean;
  /** Sidebar collapsed (icons only). Used on tablet breakpoint. */
  collapsed?: boolean;
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
    activePaths: ["/members", "/invitations/create"],
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
    icon: <Smartphone className="h-5 w-5" />,
    label: "Ghi sự kiện ngoài đồng",
    href: "/mobile/record-event",
    allowedRoles: ["VT-02", "VT-03"] as const,
  },
  {
    icon: <Database className="h-5 w-5" />,
    label: "Sự kiện chờ đồng bộ",
    href: "/offline-events",
    allowedRoles: ["VT-02", "VT-03"] as const,
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Cảnh báo tem bất thường",
    href: "/alerts/scan-anomaly",
    allowedRoles: ROLE_ACCESS.scanAnomalyAlerts,
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Nhật ký lỗi sự kiện",
    href: "/failed-event-logs",
    allowedRoles: ["VT-02", "VT-03"] as const,
  },

  // ── Thống kê & Báo cáo ────────────────
  {
    icon: <PieChart className="h-5 w-5" />,
    label: "Thống kê tra cứu",
    href: "/reports/lookup-statistics",
    allowedRoles: ["VT-01", "VT-02"] as const,
  },
  {
    icon: <Activity className="h-5 w-5" />,
    label: "Phân tích vùng trồng",
    href: "/reports/crop-area-analysis",
    allowedRoles: ["VT-01", "VT-05"] as const,
  },
  {
    icon: <GitCompare className="h-5 w-5" />,
    label: "So sánh mùa vụ",
    href: "/reports/season-yield-comparison",
    allowedRoles: ROLE_ACCESS.seasonYieldComparison,
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    label: "Báo cáo ngành",
    href: "/reports/industry",
    allowedRoles: ["VT-05"] as const,
  },
  {
    icon: <FileText className="h-5 w-5" />,
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
  collapsed = false,
}: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const visibleItems = MENU_ITEMS.filter((item) => {
    return hasAnyRole(user?.roleCode, item.allowedRoles);
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

  const sidebarWidth = collapsed ? "w-[4.5rem]" : "w-[17rem]";

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-r border-emerald-100 bg-white/90 backdrop-blur-sm transition-all duration-300 ease-in-out",
        sidebarWidth,
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-emerald-100 transition-all duration-300",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center overflow-hidden"
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
            className="text-muted-foreground hover:text-emerald-700 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* User info - only shown in expanded mode (mobile drawer or desktop) */}
      {!collapsed && user && (
        <div className="border-b border-emerald-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
              {(user.fullName || user.username || "U").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.fullName || user.username || "Người dùng"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.organizationName || user.roleCode || ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation items */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {finalItems.map((item) => {
          const active = isActive(item);

          const linkContent = (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
                active
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700",
              )}
              aria-label={collapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  "flex-shrink-0",
                  active ? "text-white" : "text-emerald-500",
                )}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          // Wrap in tooltip when collapsed (tablet mode)
          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>{linkContent}</TooltipTrigger>
                <TooltipContent className="z-[60] ml-1">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
        {finalItems.length === 0 && !collapsed && (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            Không có menu
          </p>
        )}
      </nav>

      {/* Logout button at bottom - only in expanded mode */}
      {!collapsed && onNavigate && (
        <div className="border-t border-emerald-50 px-3 py-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={onNavigate}
          >
            <span className="flex-shrink-0 text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </span>
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </aside>
  );
}