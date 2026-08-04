import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notification/NotificationBell';
import { SyncBadge } from '@/components/layout/SyncBadge';
import { ROLE_ACCESS, getRoleLabel, hasAnyRole } from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const roleLabel = getRoleLabel(user?.roleCode);
  const canOpenOrganizationProfile = hasAnyRole(
    user?.roleCode,
    ROLE_ACCESS.organizationProfile,
  );

  const accountContent = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <User className="h-4 w-4" />
      </span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block max-w-48 truncate text-sm font-medium text-foreground">
          {user?.fullName || user?.username || 'Người dùng'}
        </span>
        <span className="block max-w-48 truncate text-xs text-muted-foreground">
          {roleLabel}
          {user?.organizationName ? ` · ${user.organizationName}` : ''}
        </span>
      </span>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground hover:text-emerald-700"
          onClick={onMenuClick}
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile title */}
        <div className="min-w-0 md:hidden">
          <p className="truncate font-semibold text-emerald-800">Nguồn gốc số</p>
        </div>

        {/* Right side: account, notifications, sync, logout */}
        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          {canOpenOrganizationProfile ? (
            <Link
              to="/organizations/profile"
              className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-emerald-50"
            >
              {accountContent}
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
              {accountContent}
            </div>
          )}

          <NotificationBell />
          <SyncBadge />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={logout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="text-muted-foreground hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}