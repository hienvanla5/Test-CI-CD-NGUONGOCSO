import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Calendar, LoaderCircle, Sprout } from 'lucide-react';
import { recordHarvestEvent } from '@/api/traceEventApi';
import { LocationPicker } from '@/pages/packaging-event/components/LocationPicker';

const formSchema = z.object({
  harvestDate: z.string().min(1, 'Vui lòng chọn ngày thu hoạch'),
  quantity: z.number({
    required_error: 'Vui lòng nhập sản lượng',
    invalid_type_error: 'Sản lượng phải là số',
  }).positive('Sản lượng phải lớn hơn 0'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface HarvestFormProps {
  productionLotId: string;
  productionLotName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const HarvestForm = ({
  productionLotId,
  productionLotName,
  onSuccess,
  onCancel,
}: HarvestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      harvestDate: new Date().toISOString().split('T')[0],
      quantity: 0,
      latitude: 0,
      longitude: 0,
    },
  });

  const lat = watch('latitude');
  const lng = watch('longitude');

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await recordHarvestEvent({
        productionLotId,
        harvestDate: data.harvestDate,
        quantity: data.quantity,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      });
      toast.success(`Đã ghi nhận thu hoạch cho lô "${productionLotName}"`);
      reset();
      onSuccess?.();
    } catch (error: any) {
      const response = error.response?.data;
      let message = 'Có lỗi xảy ra khi ghi nhận thu hoạch.';

      if (response) {
        if (response.status === 400 && response.errors) {
          const errorMessages = Object.values(response.errors).join('. ');
          message = errorMessages;
        } else if (response.status === 403) {
          message = response.message || 'Bạn không có quyền thực hiện thao tác này.';
        } else if (response.status === 404) {
          message = response.message || 'Không tìm thấy lô sản xuất.';
        } else if (response.status === 409) {
          message = response.message || 'Lô sản xuất chưa được duyệt, không thể ghi sự kiện thu hoạch.';
        } else if (response.message) {
          message = response.message;
        }
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-emerald-600" />
          Ghi nhận thu hoạch
        </CardTitle>
        <CardDescription>
          Ghi nhận sự kiện thu hoạch cho lô sản xuất{' '}
          <span className="font-semibold">{productionLotName}</span>
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="harvestDate">
              Ngày thu hoạch <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="harvestDate"
                type="date"
                className="pl-10"
                {...register('harvestDate')}
              />
            </div>
            {errors.harvestDate && (
              <p className="text-sm text-red-500">{errors.harvestDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Sản lượng thu hoạch (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Nhập sản lượng thực tế"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Thêm LocationPicker */}
          <div className="space-y-2">
            <Label>Vị trí thu hoạch (click trên bản đồ)</Label>
            <div className="flex gap-2">
              <Input value={lat || ''} disabled placeholder="Vĩ độ" />
              <Input value={lng || ''} disabled placeholder="Kinh độ" />
            </div>
            <LocationPicker onLocationSelect={handleLocationSelect} height="300px" />
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>Lô sản xuất phải ở trạng thái <strong>Đã duyệt (APPROVED)</strong></li>
              <li>Sau khi ghi nhận, trạng thái lô sẽ chuyển sang <strong>Đã thu hoạch (HARVESTED)</strong></li>
              <li>Thao tác này không thể hoàn tác</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Đang ghi nhận...' : 'Ghi nhận thu hoạch'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};