import { useEffect, useState } from 'react';
import {
  getLookupStatistics,
  getAbnormalScans,
} from '@/api/lookupStatisticsApi';
import type {
  LookupStatisticsResponse,
  AbnormalScanResponse,
} from '@/types/lookupStatistics';
import { StatisticsSummary } from '@/components/report/StatisticsSummary';
import { LocationChart } from '@/components/report/LocationChart';
import { LotStatsTable } from '@/components/report/LotStatsTable';
import { TimeSeriesChart } from '@/components/report/TimeSeriesChart';
import { AbnormalScansTable } from '@/components/report/AbnormalScansTable';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

type GroupByType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

const groupByLabels: Record<GroupByType, string> = {
  DAY: 'Ngày',
  WEEK: 'Tuần',
  MONTH: 'Tháng',
  YEAR: 'Năm',
};

export default function LookupStatisticsPage() {
  const [stats, setStats] = useState<LookupStatisticsResponse | null>(null);
  const [abnormalScans, setAbnormalScans] = useState<AbnormalScanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [abnormalLoading, setAbnormalLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bộ lọc
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<GroupByType>('MONTH');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getLookupStatistics({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        groupBy,
      });
      setStats(data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể tải thống kê';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbnormalScans = async () => {
    try {
      setAbnormalLoading(true);
      const data = await getAbnormalScans({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: 10,
      });
      setAbnormalScans(data.content);
      setTotalPages(data.pageable.totalPages);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể tải danh sách bất thường';
      toast.error(msg);
    } finally {
      setAbnormalLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, groupBy]);

  useEffect(() => {
    fetchAbnormalScans();
  }, [page, startDate, endDate]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thống kê lượt tra cứu</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp số lượt quét mã theo lô và thời gian
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchStats()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="groupBy">Nhóm theo</Label>
              <Select
                value={groupBy}
                onValueChange={(value: string | null) => {
                  if (value) setGroupBy(value as GroupByType);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm">
                    {groupByLabels[groupBy]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupByLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setGroupBy('MONTH');
                }}
                className="w-full"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : stats ? (
        <>
          <StatisticsSummary stats={stats.summary} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationChart data={stats.byLocation} />
            <TimeSeriesChart data={stats.timeSeries} />
          </div>
          <LotStatsTable data={stats.byProductionLot} />
          <AbnormalScansTable
            data={abnormalScans}
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
            loading={abnormalLoading}
          />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Không có dữ liệu thống kê</p>
        </div>
      )}
    </div>
  );
}