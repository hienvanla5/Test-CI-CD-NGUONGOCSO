import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  'VT-01': 'Quản trị hệ thống',
  'VT-02': 'Quản trị tổ chức',
  'VT-03': 'Nhân viên sản xuất',
  'VT-04': 'Đơn vị vận chuyển',
  'VT-05': 'Đơn vị phân phối',
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const roleLabel = user?.roleCode
    ? ROLE_LABELS[user.roleCode] ?? user.roleCode
    : 'Người dùng';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 md:hidden">
          <p className="truncate font-semibold">Nguồn gốc số</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/organizations/profile"
            className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-48 truncate text-sm font-medium">
                {user?.fullName || user?.username || 'Người dùng'}
              </span>
              <span className="block max-w-48 truncate text-xs text-muted-foreground">
                {roleLabel}
                {user?.organizationName ? ` · ${user.organizationName}` : ''}
              </span>
            </span>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}