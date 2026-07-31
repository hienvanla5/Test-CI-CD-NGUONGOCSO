import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProductionLot } from '@/types/productionLot';

interface ProductionStatisticsProps {
  lots: ProductionLot[];
  isLoading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const statusLabels: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  HARVESTED: 'Đã thu hoạch',
  PACKAGED: 'Đã đóng gói',
  CLOSED: 'Đã kết thúc',
};

export const ProductionStatistics = ({ lots, isLoading = false }: ProductionStatisticsProps) => {
  // Thống kê theo tháng
  const monthlyStats = useMemo(() => {
    const monthMap: Record<string, { count: number; quantity: number }> = {};

    lots.forEach((lot) => {
      const date = new Date(lot.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = { count: 0, quantity: 0 };
      }
      monthMap[key].count += 1;
      monthMap[key].quantity += lot.expectedQuantity || 0;
    });

    // Sắp xếp theo thời gian
    const sortedKeys = Object.keys(monthMap).sort();
    return sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      return {
        month: `${month}/${year}`,
        count: monthMap[key].count,
        quantity: Math.round(monthMap[key].quantity * 100) / 100,
      };
    });
  }, [lots]);

  // Thống kê theo trạng thái
  const statusStats = useMemo(() => {
    const statusMap: Record<string, number> = {};
    lots.forEach((lot) => {
      const label = statusLabels[lot.status] || lot.status;
      statusMap[label] = (statusMap[label] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [lots]);

  // Tổng số lô và sản lượng
  const totalLots = lots.length;
  const totalQuantity = lots.reduce((sum, lot) => sum + (lot.expectedQuantity || 0), 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải thống kê...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (lots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Chưa có dữ liệu để hiển thị thống kê.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Tổng số lô</p>
            <p className="text-3xl font-bold">{totalLots}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Tổng sản lượng dự kiến</p>
            <p className="text-3xl font-bold">{totalQuantity.toFixed(1)} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Sản lượng trung bình/lô</p>
            <p className="text-3xl font-bold">
              {totalLots > 0 ? (totalQuantity / totalLots).toFixed(1) : 0} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Lô đã hoàn thành</p>
            <p className="text-3xl font-bold">
              {lots.filter((l) => l.status === 'CLOSED' || l.status === 'HARVESTED' || l.status === 'PACKAGED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ: 1 cột trên điện thoại, 3 biểu đồ chung 1 hàng trên máy tính/laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ cột: số lô theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Số lô theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0088FE" name="Số lô" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ cột: sản lượng theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sản lượng dự kiến (kg) theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(1)} kg`} />
                <Legend />
                <Bar dataKey="quantity" fill="#00C49F" name="Sản lượng (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ tròn: phân bố trạng thái */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân bố trạng thái lô</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {statusStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">Chưa có dữ liệu trạng thái</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};