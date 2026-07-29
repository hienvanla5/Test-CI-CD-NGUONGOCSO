import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PlusCircle,
  Sprout,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  roles?: string[];
}

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function Sidebar({
  onNavigate,
  onClose,
  showCloseButton = false,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/',
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: 'Hồ sơ tổ chức',
      href: '/organizations/profile',
    },
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: 'Tạo tổ chức',
      href: '/organizations/create',
      roles: ['VT-01'],
    },
    {
      icon: <MapPinned className="h-5 w-5" />,
      label: 'Tạo vùng trồng',
      href: '/farm-areas/create',
      roles: ['VT-01', 'VT-02'],
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => !item.roles || (user ? item.roles.includes(user.roleCode) : false),
  );

  const isActive = (href: string) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logout();
    onNavigate?.();
  };

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

      <div className="border-t p-3">
        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}