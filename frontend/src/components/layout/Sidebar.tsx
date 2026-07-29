import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  MapPinned,
  Package,
  PlusCircle,
  Sprout,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ROLE_ACCESS,
  hasAnyRole,
  type AuthenticatedRoleCode,
} from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  allowedRoles: readonly AuthenticatedRoleCode[];
}

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
    href: '/',
    allowedRoles: ROLE_ACCESS.dashboard,
  },
  {
    icon: <PlusCircle className="h-5 w-5" />,
    label: 'Tạo tổ chức',
    href: '/organizations/create',
    allowedRoles: ROLE_ACCESS.organizationCreate,
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: 'Hồ sơ tổ chức',
    href: '/organizations/profile',
    allowedRoles: ROLE_ACCESS.organizationProfile,
  },
  {
    icon: <MapPinned className="h-5 w-5" />,
    label: 'Tạo vùng trồng',
    href: '/farm-areas/create',
    allowedRoles: ROLE_ACCESS.farmAreaCreate,
  },
  {
  icon: <Package className="h-5 w-5" />,
  label: 'Lô sản xuất',
  href: '/production-lots',
  allowedRoles: ROLE_ACCESS.productionLotList,
  },
];

export function Sidebar({
  onNavigate,
  onClose,
  showCloseButton = false,
}: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const visibleItems = MENU_ITEMS.filter((item) =>
    hasAnyRole(user?.roleCode, item.allowedRoles),
  );

  const isActive = (href: string) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-full min-h-0 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2 font-bold"
        >
          <Sprout className="h-6 w-6 shrink-0 text-primary" />
          <span className="truncate text-lg">Nguồn gốc số</span>
        </Link>

        {showCloseButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}