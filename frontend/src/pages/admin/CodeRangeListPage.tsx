import { getCodeRangeStatus } from "@/api/codeRangeApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CodeRangeStatusResponse } from "@/types/codeRange";
import { Badge, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CodeRangeListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ranges, setRanges] = useState<CodeRangeStatusResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCodeRangeStatus();
        setRanges(data);
      } catch (error) {
        toast.error('Không thể tải danh sách dải mã');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'NEARLY_EXHAUSTED':
        return <Badge className="bg-yellow-500">Gần hết</Badge>;
      case 'EXHAUSTED':
        return <Badge className="bg-red-500">Đã hết</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý dải mã truy xuất</h1>
        <Link to="/admin/code-ranges/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Cấp dải mã mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dải mã</CardTitle>
        </CardHeader>
        <CardContent>
          {ranges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chưa có dải mã nào</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Tổ chức</th>
                    <th className="text-left p-2">Tiền tố</th>
                    <th className="text-right p-2">Hạn mức</th>
                    <th className="text-right p-2">Đã dùng</th>
                    <th className="text-right p-2">% sử dụng</th>
                    <th className="text-center p-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {ranges.map((range) => (
                    <tr key={range.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{range.organizationName}</td>
                      <td className="p-2 font-mono">{range.prefix}</td>
                      <td className="p-2 text-right">{range.totalLimit}</td>
                      <td className="p-2 text-right">{range.usedCount}</td>
                      <td className="p-2 text-right">{range.usagePercent.toFixed(1)}%</td>
                      <td className="p-2 text-center">{getStatusBadge(range.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeRangeListPage;