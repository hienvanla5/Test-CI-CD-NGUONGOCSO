import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, RefreshCw } from 'lucide-react';
import { getAllCertifications } from '@/api/certificationApi';
import type { CertificationResponse } from '@/types/certification';

export const CertificationList: React.FC = () => {
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<CertificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'valid' | 'expired'>('all');

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const data = await getAllCertifications();
      setCertifications(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách chứng nhận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const filteredData = certifications.filter((cert) => {
    if (filter === 'valid') return cert.isValid;
    if (filter === 'expired') return !cert.isValid;
    return true;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Danh sách chứng nhận</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filter}
              onValueChange={(val) => setFilter(val as 'all' | 'valid' | 'expired')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="valid">Còn hiệu lực</SelectItem>
                <SelectItem value="expired">Đã hết hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchCertifications} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={() => navigate('/certifications/create')}>
              <Plus className="h-4 w-4 mr-1" />
              Tạo chứng nhận
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === 'all' && 'Chưa có chứng nhận nào cho tổ chức.'}
            {filter === 'valid' && 'Không có chứng nhận nào còn hiệu lực.'}
            {filter === 'expired' && 'Không có chứng nhận nào đã hết hạn.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số hiệu</TableHead>
                  <TableHead>Tiêu chuẩn</TableHead>
                  <TableHead>Cơ quan cấp</TableHead>
                  <TableHead>Ngày cấp</TableHead>
                  <TableHead>Ngày hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.code}</TableCell>
                    <TableCell>{cert.name}</TableCell>
                    <TableCell>{cert.issuedBy || '---'}</TableCell>
                    <TableCell>{formatDate(cert.issueDate)}</TableCell>
                    <TableCell>{formatDate(cert.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant={cert.isValid ? 'default' : 'secondary'}>
                        {cert.isValid ? 'Còn hiệu lực' : 'Hết hạn'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};