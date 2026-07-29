import {
  Activity,
  Building2,
  CheckCircle2,
  Package,
  Sprout,
  Truck,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const productionData = [
  { name: 'T1', value: 60, amount: 120 },
  { name: 'T2', value: 40, amount: 80 },
  { name: 'T3', value: 75, amount: 150 },
  { name: 'T4', value: 100, amount: 200 },
  { name: 'T5', value: 85, amount: 170 },
  { name: 'T6', value: 45, amount: 90 },
];

const farmAreasData = [
  { name: 'Vùng chè Tân Cương', area: 12.5, status: 'Đang hoạt động' },
  { name: 'Vùng cà phê Cầu Đen', area: 8.3, status: 'Đang hoạt động' },
  { name: 'Vùng lúa Thái Nguyên', area: 25, status: 'Đang cập nhật' },
];

const statusData = [
  { name: 'Đang sản xuất', value: 45, className: 'bg-emerald-500' },
  { name: 'Đã thu hoạch', value: 30, className: 'bg-blue-500' },
  { name: 'Chưa trồng', value: 25, className: 'bg-amber-500' },
];

export function DashboardForm() {
  const { user } = useAuth();

  const stats = [
    { title: 'Vùng trồng', value: '12', icon: Sprout, detail: '+2 trong tháng' },
    { title: 'Lô sản xuất', value: '38', icon: Package, detail: '17 đang sản xuất' },
    { title: 'Lô hàng', value: '15', icon: Truck, detail: '6 đang vận chuyển' },
    { title: 'Người dùng', value: '23', icon: Users, detail: '21 đang hoạt động' },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tổng quan hệ thống</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Chào mừng {user?.fullName || user?.username || 'người dùng'}. Theo dõi nhanh hoạt động của tổ chức tại đây.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Frontend sẵn sàng kết nối API
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex grid-cols-[1fr_auto] flex-row items-start justify-between gap-3">
                <div>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="mt-1 text-3xl font-bold">{stat.value}</CardTitle>
                </div>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sản lượng theo tháng</CardTitle>
            <CardDescription>Sản lượng dự kiến trong 6 tháng gần nhất (tấn)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-end gap-3 rounded-lg border bg-muted/20 p-4 sm:gap-5">
              {productionData.map((item) => (
                <div key={item.name} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.amount}</span>
                  <div className="flex h-48 w-full items-end rounded-md bg-muted">
                    <div
                      className="w-full rounded-md bg-primary transition-all"
                      style={{ height: `${item.value}%` }}
                      title={`${item.amount} tấn`}
                    />
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái lô sản xuất</CardTitle>
            <CardDescription>Phân bổ trạng thái hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background:
                  'conic-gradient(#10b981 0 45%, #3b82f6 45% 75%, #f59e0b 75% 100%)',
              }}>
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-card shadow-sm">
                <Activity className="mb-1 h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">38</span>
                <span className="text-xs text-muted-foreground">tổng lô</span>
              </div>
            </div>

            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
                    {item.name}
                  </span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Vùng trồng gần đây</CardTitle>
            <CardDescription>Danh sách vùng trồng và diện tích quản lý</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[32rem]">
              <div className="grid grid-cols-[1fr_8rem_10rem] gap-4 border-b pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Tên vùng trồng</span>
                <span>Diện tích</span>
                <span>Trạng thái</span>
              </div>
              {farmAreasData.map((area) => (
                <div
                  key={area.name}
                  className="grid grid-cols-[1fr_8rem_10rem] items-center gap-4 border-b py-3 last:border-0"
                >
                  <span className="font-medium">{area.name}</span>
                  <span>{area.area} ha</span>
                  <span className="text-sm text-muted-foreground">{area.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin tổ chức</CardTitle>
            <CardDescription>Tài khoản đang đăng nhập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tổ chức</p>
                <p className="truncate font-medium">{user?.organizationName || 'Chưa cập nhật'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Vai trò</p>
                <p className="truncate font-medium">{user?.roleCode || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}