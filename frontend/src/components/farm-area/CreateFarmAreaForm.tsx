import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createFarmAreaSchema, type CreateFarmAreaFormValues } from '@/utils/validators';
import { createFarmArea, getCropTypes } from '@/api/farmAreaApi';
import type { CropType } from '@/types/farmArea';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon mặc định của Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component con để xử lý click trên bản đồ
function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export function CreateFarmAreaForm() {
  const navigate = useNavigate();
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loadingCropTypes, setLoadingCropTypes] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCropType, setSelectedCropType] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateFarmAreaFormValues>({
    resolver: zodResolver(createFarmAreaSchema),
    defaultValues: {
      name: '',
      cropType: '',
      latitude: 0,
      longitude: 0,
      area: 0,
    },
  });

  // Fetch crop types
  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        const data = await getCropTypes();
        console.log('✅ Crop types loaded:', data);
        setCropTypes(data);
        // Nếu có dữ liệu và selectedCropType đang có giá trị không tồn tại thì reset
      } catch (error) {
        console.error('❌ Lỗi tải crop types:', error);
        toast.error('Không thể tải danh sách loại cây trồng');
      } finally {
        setLoadingCropTypes(false);
      }
    };
    fetchCropTypes();
  }, []);

  // Reset selectedCropType nếu giá trị không khớp với cropTypes
  useEffect(() => {
    if (cropTypes.length > 0 && selectedCropType) {
      const exists = cropTypes.some(c => c.id === selectedCropType);
      if (!exists) {
        console.warn(`⚠️ selectedCropType "${selectedCropType}" không tồn tại, reset về rỗng`);
        setSelectedCropType('');
        setValue('cropType', '');
      }
    }
  }, [cropTypes, selectedCropType, setValue]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const onSubmit = async (values: CreateFarmAreaFormValues) => {
    try {
      const result = await createFarmArea({
        name: values.name,
        cropType: values.cropType,
        latitude: values.latitude,
        longitude: values.longitude,
        area: values.area,
      });
      toast.success(`Vùng trồng "${result.data.name}" đã được tạo thành công!`);
      navigate('/farm-areas');
    } catch (error: any) {
      const response = error.response?.data;
      if (response?.status === 400 && response?.errors) {
        Object.entries(response.errors).forEach(([key, message]) => {
          setError(key as keyof CreateFarmAreaFormValues, {
            message: message as string,
          });
        });
      } else {
        toast.error(response?.message || 'Có lỗi xảy ra khi tạo vùng trồng');
      }
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Khai báo vùng trồng mới</CardTitle>
        <CardDescription>
          Nhập thông tin vùng trồng và chọn vị trí trên bản đồ.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên vùng trồng *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="VD: Vùng chè Tân Cương"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cropType">Loại cây trồng *</Label>
              <Select
                items={cropTypes.map((c) => ({ value: c.id, label: c.name }))}
                value={selectedCropType || ''}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedCropType(value);
                    setValue('cropType', value);
                  }
                }}
              >
                <SelectTrigger id="cropType">
                  <SelectValue placeholder="Chọn loại cây trồng" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCropTypes ? (
                    <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                  ) : cropTypes.length === 0 ? (
                    <SelectItem value="empty" disabled>Không có loại cây trồng</SelectItem>
                  ) : (
                    cropTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.cropType && <p className="text-sm text-red-500">{errors.cropType.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Diện tích (ha) *</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="VD: 6.69"
                {...register('area', { valueAsNumber: true })}
              />
              {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Vị trí (click trên bản đồ) *</Label>
              <div className="flex gap-2">
                <Input
                  value={selectedPosition ? `${selectedPosition.lat}` : ''}
                  placeholder="Vĩ độ"
                  disabled
                />
                <Input
                  value={selectedPosition ? `${selectedPosition.lng}` : ''}
                  placeholder="Kinh độ"
                  disabled
                />
              </div>
              {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
              {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message}</p>}
            </div>
          </div>

          {/* Bản đồ */}
          <div className="h-96 w-full rounded-md overflow-hidden border">
            <MapContainer
              center={[21.0285, 105.8542]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <LocationMarker onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>
          <p className="text-sm text-muted-foreground">
            * Nhấp chuột vào bản đồ để chọn vị trí vùng trồng.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/farm-areas')}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo vùng trồng'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}