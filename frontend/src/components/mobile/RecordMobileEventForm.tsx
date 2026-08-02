import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, MapPin, Loader2 } from "lucide-react";
import {
  mobileEventSchema,
  type MobileEventFormValues,
} from "@/utils/validators";
import { recordMobileEvent } from "@/api/chainEventApi";
import type { ProductionLot } from "@/types/productionLot";
import { ChainEventType, ChainEventTypeLabel } from "@/enums/chainEventType";

interface Props {
  lots: ProductionLot[];
  onSuccess?: () => void;
}

const MAX_IMAGES = 5;

export const RecordMobileEventForm: React.FC<Props> = ({ lots, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MobileEventFormValues>({
    resolver: zodResolver(mobileEventSchema),
    defaultValues: {
      eventType: ChainEventType.HARVEST,
      recordedAt: new Date().toISOString(),
      latitude: 0,
      longitude: 0,
      images: [],
      harvestDate: new Date().toISOString().split("T")[0],
      packagingDate: new Date().toISOString().split("T")[0],
    },
  });

  const eventType = watch("eventType");

  // Lấy vị trí GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
        setLocationLoading(false);
        toast.success("Đã lấy vị trí GPS");
      },
      (err) => {
        toast.error("Không thể lấy vị trí: " + err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;
  const fileArray = Array.from(files);
  if (imageFiles.length + fileArray.length > MAX_IMAGES) {
    toast.error(`Chỉ được chọn tối đa ${MAX_IMAGES} ảnh`);
    return;
  }
  setImageFiles((prev) => [...prev, ...fileArray]);
  const newPreviews = fileArray.map((f) => URL.createObjectURL(f));
  const updatedPreviews = [...imagePreviews, ...newPreviews];
  setImagePreviews(updatedPreviews);
  // ✅ Cập nhật vào react-hook-form để validation biết có ảnh
  setValue('images', updatedPreviews, { shouldValidate: true });
};

  const removeImage = (index: number) => {
  const newFiles = imageFiles.filter((_, i) => i !== index);
  setImageFiles(newFiles);
  const newPreviews = imagePreviews.filter((_, i) => i !== index);
  setImagePreviews(newPreviews);
  // ✅ Cập nhật lại danh sách ảnh trong form
  setValue('images', newPreviews, { shouldValidate: true });
};

  // Chuyển File sang base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = async (data: MobileEventFormValues) => {
    setIsSubmitting(true);
    try {
      // Chuyển ảnh sang base64
      const base64Images = await Promise.all(imageFiles.map(fileToBase64));

      const payload = {
        productionLotId: data.productionLotId,
        eventType: data.eventType,
        recordedAt: data.recordedAt,
        latitude: data.latitude,
        longitude: data.longitude,
        images: base64Images,
        deviceSource: "MOBILE",
        eventData:
          data.eventType === ChainEventType.HARVEST
            ? {
                quantity: data.quantity,
                harvestDate: data.harvestDate,
              }
            : {
                packagingSpecification: data.packagingSpecification,
                packagingDate: data.packagingDate,
              },
      };

      await recordMobileEvent(payload);
      toast.success("Ghi sự kiện thành công!");
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setValue('images', []);
      onSuccess?.();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Ghi sự kiện thất bại";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc lô theo trạng thái phù hợp (tuỳ backend, có thể lọc sẵn từ API)
  const filteredLots = lots.filter(
    (lot) => lot.status === "APPROVED" || lot.status === "HARVESTED",
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>📱 Ghi sự kiện ngoài đồng</CardTitle>
        <CardDescription>
          Nhập thông tin thu hoạch hoặc đóng gói kèm ảnh thực địa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Chọn lô */}
          <div className="space-y-2">
            <Label>Lô sản xuất *</Label>
            <Controller
              name="productionLotId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lô sản xuất">
                      {field.value &&
                        lots.find((l) => l.id === field.value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.name} ({lot.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productionLotId && (
              <p className="text-sm text-red-500">
                {errors.productionLotId.message}
              </p>
            )}
          </div>

          {/* Loại sự kiện */}
          <div className="space-y-2">
            <Label>Loại sự kiện *</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Reset dynamic fields...
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại">
                      {field.value &&
                        ChainEventTypeLabel[field.value as ChainEventType]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ChainEventType.HARVEST}>
                      {ChainEventTypeLabel[ChainEventType.HARVEST]}
                    </SelectItem>
                    <SelectItem value={ChainEventType.PACKAGING}>
                      {ChainEventTypeLabel[ChainEventType.PACKAGING]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.eventType && (
              <p className="text-sm text-red-500">{errors.eventType.message}</p>
            )}
          </div>

          {/* Thời gian ghi nhận */}
          <div className="space-y-2">
            <Label>Thời điểm *</Label>
            <Controller
              name="recordedAt"
              control={control}
              render={({ field }) => (
                <Input
                  type="datetime-local"
                  value={field.value.slice(0, 16)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) field.onChange(new Date(val).toISOString());
                  }}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.recordedAt && (
              <p className="text-sm text-red-500">
                {errors.recordedAt.message}
              </p>
            )}
          </div>

          {/* Vị trí GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Vị trí GPS *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getLocation}
                disabled={locationLoading || isSubmitting}
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <MapPin className="h-4 w-4 mr-1" />
                )}
                Lấy vị trí
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="any"
                    placeholder="Vĩ độ"
                    {...field}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    step="any"
                    placeholder="Kinh độ"
                    {...field}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className="text-sm text-red-500">
                {errors.latitude?.message || errors.longitude?.message}
              </p>
            )}
          </div>

          {/* Dynamic fields theo loại */}
          {eventType === ChainEventType.HARVEST && (
            <>
              <div className="space-y-2">
                <Label>Sản lượng (kg) *</Label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Nhập sản lượng"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ngày thu hoạch *</Label>
                <Controller
                  name="harvestDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} disabled={isSubmitting} />
                  )}
                />
                {errors.harvestDate && (
                  <p className="text-sm text-red-500">
                    {errors.harvestDate.message}
                  </p>
                )}
              </div>
            </>
          )}

          {eventType === ChainEventType.PACKAGING && (
            <>
              <div className="space-y-2">
                <Label>Quy cách đóng gói *</Label>
                <Controller
                  name="packagingSpecification"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Ví dụ: 10kg/bao"
                      {...field}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.packagingSpecification && (
                  <p className="text-sm text-red-500">
                    {errors.packagingSpecification.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ngày đóng gói *</Label>
                <Controller
                  name="packagingDate"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} disabled={isSubmitting} />
                  )}
                />
                {errors.packagingDate && (
                  <p className="text-sm text-red-500">
                    {errors.packagingDate.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Upload ảnh */}
          <div className="space-y-2">
            <Label>Hình ảnh thực địa * (tối thiểu 1)</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("imageInput")?.click()}
                disabled={isSubmitting || imageFiles.length >= MAX_IMAGES}
              >
                <Camera className="h-4 w-4 mr-1" />
                Chọn ảnh
              </Button>
              <span className="text-sm text-muted-foreground">
                {imageFiles.length}/{MAX_IMAGES}
              </span>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded border overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      onClick={() => removeImage(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang ghi...
              </>
            ) : (
              "Ghi sự kiện"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
