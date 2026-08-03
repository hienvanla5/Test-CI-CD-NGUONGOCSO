import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  importProductionLots,
  downloadImportTemplate,
} from '@/api/productionLotApi';
import { getOrganizations } from '@/api/organizationApi';
import {
  importProductionLotSchema,
  type ImportProductionLotFormValues,
} from '@/utils/validators';
import type { ProductionLotImportResultResponse } from '@/types/productionLotImport';
import type { Organization } from '@/types/organization';
import { useAuth } from '@/hooks/useAuth';

interface ImportProductionLotFormProps {
  onSuccess?: () => void;
}

export const ImportProductionLotForm: React.FC<ImportProductionLotFormProps> = ({
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [result, setResult] = useState<ProductionLotImportResultResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAdmin = user?.roleCode === 'VT-01';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ImportProductionLotFormValues>({
    resolver: zodResolver(importProductionLotSchema),
    defaultValues: {
      file: undefined,
      organizationId: '',
    },
  });

  const selectedFile = watch('file');

  useEffect(() => {
    if (isAdmin) {
      setLoadingOrgs(true);
      getOrganizations()
        .then((data) => {
          setOrganizations(data);
        })
        .catch(() => {
          toast.error('Không thể tải danh sách tổ chức');
        })
        .finally(() => setLoadingOrgs(false));
    }
  }, [isAdmin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('file', file, { shouldValidate: true });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadImportTemplate();
      toast.success('Đã tải mẫu tệp thành công');
    } catch (error) {
      toast.error('Không thể tải mẫu tệp');
    }
  };

  const onSubmit = async (data: ImportProductionLotFormValues) => {
    if (!data.file) {
      toast.error('Vui lòng chọn tệp dữ liệu');
      return;
    }

    setSubmitting(true);
    try {
      const result = await importProductionLots(
        data.file,
        data.organizationId || undefined
      );
      setResult(result);
      setDialogOpen(true);
      reset();
      onSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Nhập dữ liệu thất bại';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (result?.status === 'SUCCESS' || result?.status === 'PARTIAL_SUCCESS') {
      navigate('/production-lots');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Thành công</Badge>;
      case 'PARTIAL_SUCCESS':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Một phần</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Nhập dữ liệu lô sản xuất hàng loạt</CardTitle>
          <CardDescription>
            Tải lên tệp CSV hoặc Excel theo mẫu chuẩn để nhập danh sách lô sản xuất và nhật ký canh tác.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Tổ chức (chỉ hiển thị với VT-01) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="organizationId">Tổ chức</Label>
                <Controller
                  name="organizationId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingOrgs || submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tổ chức (để trống là tổ chức của bạn)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tổ chức của tôi</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name} ({org.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.organizationId && (
                  <p className="text-sm text-red-500">{errors.organizationId.message}</p>
                )}
              </div>
            )}

            {/* File upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Tệp dữ liệu *</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="cursor-pointer"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải mẫu
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
              {errors.file && (
                <p className="text-sm text-red-500">{errors.file.message}</p>
              )}
            </div>

            {/* Hướng dẫn */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">📌 Yêu cầu tệp dữ liệu:</p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                <li>Định dạng <strong>.csv</strong> hoặc <strong>.xlsx</strong></li>
                <li>Các cột bắt buộc: <strong>ten_lo</strong>, <strong>ma_loai_nong_san</strong>, <strong>san_luong_du_kien</strong>, <strong>ngay_gieo_trong</strong></li>
                <li>Ngày tháng theo định dạng: <strong>dd/MM/yyyy</strong></li>
                <li>Tải mẫu để xem cấu trúc đầy đủ</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/production-lots')}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Nhập dữ liệu
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Dialog kết quả */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result?.status === 'SUCCESS' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {result?.status === 'PARTIAL_SUCCESS' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
              {result?.status === 'FAILED' && <XCircle className="h-5 w-5 text-red-500" />}
              Kết quả nhập dữ liệu
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              {/* Thông tin tổng quan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{result.totalRows}</p>
                  <p className="text-xs text-muted-foreground">Tổng dòng</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{result.successCount}</p>
                  <p className="text-xs text-muted-foreground">Thành công</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
                  <p className="text-xs text-muted-foreground">Thất bại</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-lg font-bold">{getStatusBadge(result.status)}</p>
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                </div>
              </div>

              {/* Danh sách lỗi */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Chi tiết lỗi theo dòng</h4>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Dòng</TableHead>
                          <TableHead>Lý do</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.errors.map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono">{err.rowNumber}</TableCell>
                            <TableCell className="text-red-600">{err.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {result.failedCount === 0 && (
                <div className="text-center py-4 text-emerald-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Tất cả {result.successCount} dòng đều được nhập thành công!</p>
                </div>
              )}

              {result.successCount === 0 && result.failedCount > 0 && (
                <div className="text-center py-4 text-red-600">
                  <XCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Không có dòng nào được nhập thành công.</p>
                  <p className="text-sm">Vui lòng sửa lỗi và thử lại.</p>
                </div>
              )}

              <DialogFooter>
                <Button onClick={handleCloseDialog}>
                  {result.status === 'SUCCESS' ? 'Xem danh sách lô' : 'Đóng'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};