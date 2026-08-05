import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
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
import { Loader2, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
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

/**
 * Mapping HTTP status codes to user-friendly Vietnamese messages
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại tệp CSV.',
  401: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện chức năng này.',
  404: 'API không tồn tại. Vui lòng liên hệ quản trị viên.',
  409: 'Dữ liệu đã tồn tại hoặc vi phạm ràng buộc.',
  413: 'Tệp quá lớn. Vui lòng giảm kích thước tệp hoặc tách thành nhiều tệp nhỏ.',
  422: 'Dữ liệu trong tệp không hợp lệ. Vui lòng kiểm tra lại.',
  500: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
};

/**
 * Get user-friendly error message from Axios error
 */
const getErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return 'Đã xảy ra lỗi không xác định.';
  }

  const status = error.response?.status;
  if (status && ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }

  // Try to extract backend message
  const backendMessage = error.response?.data?.message;
  if (backendMessage && typeof backendMessage === 'string') {
    return backendMessage;
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }

  return 'Đã xảy ra lỗi khi nhập dữ liệu. Vui lòng thử lại.';
};

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
  const [uploadProgress, setUploadProgress] = useState(0);

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
      setUploadProgress(0);
      setResult(null);
    }
  };

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await downloadImportTemplate();
      toast.success('Đã tải mẫu tệp CSV thành công');
    } catch {
      toast.error('Không thể tải mẫu tệp. Vui lòng thử lại.');
    }
  }, []);

  const onSubmit = async (data: ImportProductionLotFormValues) => {
    if (!data.file) {
      toast.error('Vui lòng chọn tệp dữ liệu');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);
    try {
      // Simulate incremental upload progress
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const importResult = await importProductionLots(
        data.file,
        data.organizationId || undefined,
      );

      clearInterval(progressTimer);
      setUploadProgress(100);
      setResult(importResult);
      setDialogOpen(true);
      reset();
      onSuccess?.();
      toast.success('Đã hoàn tất nhập dữ liệu');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    if (result?.status === 'SUCCESS' || result?.status === 'PARTIAL_SUCCESS') {
      navigate('/production-lots');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return {
          badge: <Badge className="bg-emerald-500 hover:bg-emerald-600">Thành công</Badge>,
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          label: 'Thành công',
        };
      case 'PARTIAL_SUCCESS':
        return {
          badge: <Badge className="bg-yellow-500 hover:bg-yellow-600">Một phần</Badge>,
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          label: 'Thành công một phần',
        };
      case 'FAILED':
        return {
          badge: <Badge variant="destructive">Thất bại</Badge>,
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: 'Thất bại',
        };
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: status,
        };
    }
  };

  const statusConfig = result ? getStatusConfig(result.status) : null;

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Nhập dữ liệu lô sản xuất hàng loạt</CardTitle>
          <CardDescription>
            Tải lên tệp CSV (UTF-8) theo mẫu chuẩn để nhập danh sách lô sản xuất và nhật ký canh tác.
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('production-lot-import-file')?.click()}
                  disabled={submitting}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  Chọn tệp CSV
                </Button>
                <input
                  id="production-lot-import-file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải mẫu CSV
                </Button>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
              {errors.file && (
                <p className="text-sm text-red-500">{errors.file.message}</p>
              )}
            </div>

            {/* Upload progress indicator */}
            {submitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đang tải lên và xử lý...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Hướng dẫn */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">📌 Yêu cầu tệp CSV:</p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-muted-foreground">
                <li>Định dạng <strong>.csv</strong> (UTF-8, dấu phẩy)</li>
                <li>Các cột bắt buộc: <strong>ten_lo</strong>, <strong>ma_loai_nong_san</strong>, <strong>ma_vung_trong</strong>, <strong>san_luong_du_kien</strong>, <strong>san_luong_thuc_thu</strong>, <strong>ngay_gieo_trong</strong>, <strong>ngay_thu_hoach</strong>, <strong>hoat_dong_canh_tac</strong>, <strong>vat_tu</strong>, <strong>so_luong</strong>, <strong>don_vi</strong>, <strong>ngay_thuc_hien</strong>, <strong>ghi_chu</strong></li>
                <li>Ngày tháng theo định dạng: <strong>dd/MM/yyyy</strong></li>
                <li>Mã loại nông sản và mã vùng trồng phải là <strong>UUID</strong> hợp lệ</li>
                <li>Hoạt động canh tác phải là một trong: PLANTING, WATERING, FERTILIZING, PESTICIDE, WEEDING, HARVESTING, OTHER</li>
                <li>Tải mẫu CSV để xem cấu trúc đầy đủ và dữ liệu mẫu</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate('/production-lots')}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !selectedFile}>
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
        <DialogContent className="max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusConfig?.icon}
              Kết quả nhập dữ liệu
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              {/* File info */}
              {result.fileName && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Tệp:</span> {result.fileName}
                </div>
              )}

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
                <div className="rounded-lg bg-blue-50 p-3 text-center flex flex-col items-center justify-center">
                  {statusConfig?.badge}
                  <p className="text-xs text-muted-foreground mt-1">Trạng thái</p>
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
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
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

              {result.successCount > 0 && result.failedCount > 0 && (
                <div className="text-center py-4 text-yellow-600">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">
                    {result.successCount} dòng thành công, {result.failedCount} dòng thất bại.
                  </p>
                  <p className="text-sm">Các dòng thành công đã được lưu. Vui lòng sửa các dòng lỗi và nhập lại.</p>
                </div>
              )}

              {/* Thời gian import */}
              {result.importedAt && (
                <div className="text-xs text-muted-foreground text-right">
                  Hoàn tất: {new Date(result.importedAt).toLocaleString('vi-VN')}
                </div>
              )}

              <DialogFooter>
                <Button variant="view" onClick={handleCloseDialog}>
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