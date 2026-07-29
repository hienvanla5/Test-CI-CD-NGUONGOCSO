import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ProductionLot } from '@/types/farm';
import { PackageOpen, Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProductionLotListProps {
  lots: ProductionLot[];
  isLoading: boolean;
  canCreate: boolean;
  canEdit: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
}

const statusLabels: Record<ProductionLot['status'], string> = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  HARVESTED: 'Đã thu hoạch',
  PACKAGED: 'Đã đóng gói',
  CLOSED: 'Đã kết thúc',
};

const statusClasses: Record<ProductionLot['status'], string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  HARVESTED: 'bg-lime-100 text-lime-700',
  PACKAGED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-zinc-200 text-zinc-700',
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN').format(
    new Date(`${value}T00:00:00`),
  );
};

export const ProductionLotList = ({
  lots,
  isLoading,
  canCreate,
  canEdit,
  onCreate,
  onEdit,
}: ProductionLotListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLots = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return lots.filter((lot) => {
      const matchesSearch = !keyword || [
        lot.name,
        lot.farmAreaName ?? '',
        lot.productCategoryName ?? '',
      ].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus =
        statusFilter === 'ALL' || lot.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [lots, search, statusFilter]);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Danh sách lô sản xuất</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi lô theo vùng trồng, nông sản và trạng thái xử lý.
            </p>
          </div>

          {canCreate && (
            <Button type="button" onClick={onCreate}>
              <Plus className="size-4" />
              Tạo lô sản xuất
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-3 border-b bg-slate-50/70 p-4 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="bg-white pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên lô, vùng trồng hoặc loại nông sản..."
              aria-label="Tìm kiếm lô sản xuất"
            />
          </label>

          <select
            className="h-9 rounded-md border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  'Tên lô',
                  'Vùng trồng',
                  'Nông sản',
                  'Sản lượng dự kiến',
                  'Ngày gieo trồng',
                  'Trạng thái',
                  'Thao tác',
                ].map((title) => (
                  <th className="px-4 py-3 font-semibold" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500" colSpan={7}>
                    Đang tải danh sách lô sản xuất...
                  </td>
                </tr>
              )}

              {!isLoading && filteredLots.map((lot) => (
                <tr className="border-t hover:bg-emerald-50/30" key={lot.id}>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {lot.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {lot.farmAreaName ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {lot.productCategoryName ?? '—'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {lot.expectedQuantity.toLocaleString('vi-VN')}{' '}
                    {lot.expectedQuantityUnit || ''}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDate(lot.plantingDate)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[lot.status]}`}
                    >
                      {statusLabels[lot.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {canEdit && lot.status === 'DRAFT' ? (
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => onEdit(lot.id)}
                      >
                        <Pencil className="size-4" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && !filteredLots.length && (
            <div className="grid place-items-center px-4 py-16 text-center">
              <PackageOpen className="mb-3 size-10 text-slate-300" />
              <p className="font-semibold">Không tìm thấy lô sản xuất</p>
              <p className="mt-1 text-sm text-slate-500">
                Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};