import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

import { createFarmArea, getCropTypes } from '@/api/farmAreaApi';
import type { AreaUnit, CropType } from '@/types/farmArea';
import { AREA_UNIT_LABELS } from '@/types/farmArea';
import { LocationPicker } from '@/pages/packaging-event/components/LocationPicker';
import { useAutoGeolocation } from '@/hooks/useAutoGeolocation';

const formSchema = z.object({
  name: z.string().min(1, 'Tên vùng trồng không được để trống').max(255),
  cropType: z.string().uuid('Vui lòng chọn loại cây trồng'),
  latitude: z.number({ required_error: 'Vui lòng chọn vị trí trên bản đồ' }),
  longitude: z.number({ required_error: 'Vui lòng chọn vị trí trên bản đồ' }),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
  areaUnit: z.enum(['HA', 'KM2'], { required_error: 'Vui lòng chọn đơn vị diện tích' }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess: (newArea: any) => void;
  onCancel: () => void;
}

export const CreateFarmAreaForm = ({
  onSuccess,
  onCancel,
}: Props) => {
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cropType: '',
      latitude: 0,
      longitude: 0,
      area: 0,
      areaUnit: 'HA',
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const currentPosition =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0)
      ? {
          lat: latitude,
          lng: longitude,
        }
      : undefined;

  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        const data = await getCropTypes();
        setCropTypes(data);
      } catch {
        toast.error('Không thể tải danh sách loại cây trồng');
      } finally {
        setLoading(false);
      }
    };

    void fetchCropTypes();
  }, []);

  const handleLocationSelect = (
    selectedLatitude: number,
    selectedLongitude: number,
  ) => {
    setValue('latitude', selectedLatitude, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('longitude', selectedLongitude, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const { locationLoading, fetchLocation } = useAutoGeolocation({
    onLocation: (selectedLatitude, selectedLongitude) => {
      handleLocationSelect(selectedLatitude, selectedLongitude);
      toast.success('Đã lấy vị trí hiện tại');
    },

    onError: (message) => {
      toast.error(`Không thể lấy vị trí: ${message}`);
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await createFarmArea({
        name: values.name,
        cropType: values.cropType,
        latitude: values.latitude,
        longitude: values.longitude,
        area: values.area,
        areaUnit: values.areaUnit,
      });

      toast.success(`Vùng trồng "${result.name}" đã được tạo!`);
      onSuccess(result);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra',
      );
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Tên vùng trồng *</Label>

        <Input
          id="name"
          {...register('name')}
          placeholder="VD: Vùng chè Tân Cương"
        />

        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cropType">Loại cây trồng *</Label>

        <Select
          value={watch('cropType')}
          onValueChange={(value) => {
            setValue('cropType', value || '', {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        >
          <SelectTrigger id="cropType">
            <SelectValue placeholder="Chọn loại cây trồng" />
          </SelectTrigger>

          <SelectContent>
            {cropTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.cropType && (
          <p className="text-sm text-red-500">
            {errors.cropType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Vị trí trên bản đồ *</Label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locationLoading}
            onClick={() => fetchLocation()}
          >
            {locationLoading
              ? 'Đang lấy vị trí...'
              : 'Lấy vị trí hiện tại'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            value={currentPosition?.lat ?? ''}
            disabled
            placeholder="Vĩ độ"
          />

          <Input
            value={currentPosition?.lng ?? ''}
            disabled
            placeholder="Kinh độ"
          />
        </div>

        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialPosition={currentPosition}
          height="300px"
        />

        {errors.latitude && (
          <p className="text-sm text-red-500">
            {errors.latitude.message}
          </p>
        )}

        {errors.longitude && (
          <p className="text-sm text-red-500">
            {errors.longitude.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="area">Diện tích *</Label>
        <div className="flex gap-2">
          <Input
            id="area"
            type="number"
            step="0.01"
            className="flex-1"
            {...register('area', { valueAsNumber: true })}
            placeholder="VD: 5.5"
          />
          <Select
            value={watch('areaUnit')}
            onValueChange={(value) => setValue('areaUnit', value as AreaUnit)}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AREA_UNIT_LABELS).map(([unit, label]) => (
                <SelectItem key={unit} value={unit}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
        {errors.areaUnit && <p className="text-sm text-red-500">{errors.areaUnit.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Hủy
        </Button>

        <Button
          type="submit"
          variant="create"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo...' : 'Tạo vùng trồng'}
        </Button>
      </div>
    </form>
  );
};