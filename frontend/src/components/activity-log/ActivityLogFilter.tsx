import { useState } from 'react';
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
import { Search, X } from 'lucide-react';

const ACTION_OPTIONS = [
  { value: 'CREATE', label: 'Tạo mới' },
  { value: 'UPDATE', label: 'Cập nhật' },
  { value: 'DELETE', label: 'Xóa' },
  { value: 'APPROVE', label: 'Phê duyệt' },
  { value: 'REJECT', label: 'Từ chối' },
  { value: 'ACTIVATE', label: 'Kích hoạt' },
  { value: 'RECALL', label: 'Thu hồi' },
  { value: 'EXPORT', label: 'Xuất hồ sơ' },
  { value: 'LOGIN', label: 'Đăng nhập' },
  { value: 'LOGOUT', label: 'Đăng xuất' },
];

interface Props {
  onFilter: (params: any) => void;
  onReset: () => void;
  loading?: boolean;
}

export const ActivityLogFilter = ({ onFilter, onReset, loading }: Props) => {
  const [action, setAction] = useState('');
  const [actorName, setActorName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({ action, actorName, startDate, endDate });
  };

  const handleReset = () => {
    setAction('');
    setActorName('');
    setStartDate('');
    setEndDate('');
    onReset();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="action">Loại thao tác</Label>
              <Select
                value={action}
                onValueChange={(value: string | null) => {
                  if (value !== null) {
                    setAction(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="actorName">Người thực hiện</Label>
              <Input
                id="actorName"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="Tên hoặc username..."
              />
            </div>

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
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
            <Button type="submit" size="sm" variant="create" disabled={loading}>
              <Search className="h-4 w-4 mr-1" />
              Tìm kiếm
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};