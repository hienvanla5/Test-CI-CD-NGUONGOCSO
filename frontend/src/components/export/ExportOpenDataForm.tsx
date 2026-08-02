import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2 } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { exportOpenData } from '@/api/exportApi';
import { getProductCategories } from '@/api/productCategoryApi';
import { getOrganizations } from '@/api/organizationApi';
import { useAuth } from '@/hooks/useAuth';
import type { Organization } from '@/types/organization';
import type { ProductCategory } from '@/types/productCategory';
import {
  exportOpenDataSchema,
  type ExportOpenDataFormValues,
} from '@/utils/validators';

export const ExportOpenDataForm = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleCode === 'VT-01';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExportOpenDataFormValues>({
    resolver: zodResolver(exportOpenDataSchema),
    defaultValues: {
      format: 'JSON',
      organizationId: undefined,
      productCategoryIds: [],
      shipmentIds: [],
      fromDate: undefined,
      toDate: undefined,
    },
  });

  const selectedFormat = watch('format');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // VT-05 không có quyền gọi /admin/organizations,
        // chỉ tải danh sách tổ chức nếu là admin (VT-01)
        const [orgs, cats] = await Promise.all([
          isAdmin ? getOrganizations() : Promise.resolve([] as Organization[]),
          getProductCategories(),
        ]);
        setOrganizations(orgs);
        setCategories(cats);
      } catch {
        toast.error('Không thể tải dữ liệu danh mục');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const onSubmit = async (data: ExportOpenDataFormValues) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { format: data.format };
      if (data.organizationId) payload.organizationId = data.organizationId;
      if (data.fromDate) payload.fromDate = data.fromDate;
      if (data.toDate) payload.toDate = data.toDate;
      if (data.productCategoryIds?.length)
        payload.productCategoryIds = data.productCategoryIds;
      if (data.shipmentIds?.length) payload.shipmentIds = data.shipmentIds;

      const blob = await exportOpenData(payload as Parameters<typeof exportOpenData>[0]);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `export_${new Date().toISOString().slice(0, 10)}.${data.format.toLowerCase()}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Xuất dữ liệu thành công!');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Blob; status?: number } };
      if (axiosError.response?.data instanceof Blob) {
        const text = await axiosError.response.data.text();
        try {
          const json: { message?: string } = JSON.parse(text);
          toast.error(json.message || 'Xuất dữ liệu thất bại');
        } catch {
          toast.error('Xuất dữ liệu thất bại');
        }
      } else {
        toast.error((error as { message?: string }).message || 'Xuất dữ liệu thất bại');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Xuất dữ liệu mở</CardTitle>
        <CardDescription>
          Chọn phạm vi và định dạng để xuất dữ liệu truy xuất theo lược đồ chuẩn.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Tổ chức – chỉ hiển thị cho VT-01 (admin), VT-05 không có quyền /admin/organizations */}
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">Tổ chức</Label>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(val) => field.onChange(val || undefined)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="organizationId">
                      <SelectValue placeholder="Tất cả tổ chức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
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

          {/* Khoảng thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">Từ ngày</Label>
              <Controller
                name="fromDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="fromDate"
                    type="datetime-local"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={submitting}
                  />
                )}
              />
              {errors.fromDate && (
                <p className="text-sm text-red-500">{errors.fromDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">Đến ngày</Label>
              <Controller
                name="toDate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="toDate"
                    type="datetime-local"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    disabled={submitting}
                  />
                )}
              />
              {errors.toDate && (
                <p className="text-sm text-red-500">{errors.toDate.message}</p>
              )}
            </div>
          </div>

          {/* Danh mục sản phẩm */}
          <div className="space-y-2">
            <Label htmlFor="productCategoryIds">Danh mục sản phẩm</Label>
            <Controller
              name="productCategoryIds"
              control={control}
              render={({ field }) => (
                <Select
                  value=""
                  onValueChange={(val) => {
                    if (!val) return;
                    const current = field.value ?? [];
                    if (current.includes(val)) {
                      field.onChange(current.filter((v) => v !== val));
                    } else {
                      field.onChange([...current, val]);
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="productCategoryIds">
                    <SelectValue placeholder="Chọn danh mục (có thể chọn nhiều)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {field.value?.includes(cat.id) ? '✓ ' : ''}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productCategoryIds && (
              <p className="text-sm text-red-500">
                {errors.productCategoryIds.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Chọn một danh mục sẽ thêm vào danh sách. Để bỏ chọn, click lại.
            </p>
          </div>

          {/* Định dạng */}
          <div className="space-y-2">
            <Label>Định dạng *</Label>
            <Controller
              name="format"
              control={control}
              render={({ field }) => (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="JSON"
                      checked={field.value === 'JSON'}
                      onChange={() => field.onChange('JSON')}
                      disabled={submitting}
                    />
                    JSON
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="CSV"
                      checked={field.value === 'CSV'}
                      onChange={() => field.onChange('CSV')}
                      disabled={submitting}
                    />
                    CSV
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="XML"
                      checked={field.value === 'XML'}
                      onChange={() => field.onChange('XML')}
                      disabled={submitting}
                    />
                    XML (chưa hỗ trợ)
                  </label>
                </div>
              )}
            />
            {errors.format && (
              <p className="text-sm text-red-500">{errors.format.message}</p>
            )}
            {selectedFormat === 'XML' && (
              <p className="text-sm text-yellow-600">
                ⚠️ Định dạng XML chưa được hỗ trợ. Vui lòng chọn JSON hoặc CSV.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Xuất dữ liệu
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};