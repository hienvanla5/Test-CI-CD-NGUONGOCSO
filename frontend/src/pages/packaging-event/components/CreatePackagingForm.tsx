import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  recordPackagingSchema,
  type RecordPackagingFormValues,
} from "@/utils/validators/packagingEventSchema";
import type { ProductionLot } from "@/types/productionLot";
import {
  getHarvestedProductionLots,
  recordPackagingEvent,
} from "@/api/packagingApi";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { LocationPicker } from "@/pages/packaging-event/components/LocationPicker";
import { Button } from "../../../components/ui/button";

export function CreatePackagingForm() {
  const navigate = useNavigate();
  const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecordPackagingFormValues>({
    resolver: zodResolver(recordPackagingSchema),
    defaultValues: {
      productionLotId: "",
      packagingSpecification: "",
      packagingDate: new Date().toISOString().split("T")[0],
      latitude: 0,
      longitude: 0,
    },
  });

  const lat = watch("latitude");
  const lng = watch("longitude");

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const data = await getHarvestedProductionLots();
        setProductionLots(data);
      } catch {
        toast.error("Không thể tải danh sách lô sản xuất");
      } finally {
        setLoadingLots(false);
      }
    };
    fetchLots();
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  const onSubmit = async (values: RecordPackagingFormValues) => {
    try {
      await recordPackagingEvent({
        productionLotId: values.productionLotId,
        packagingSpecification: values.packagingSpecification,
        packagingDate: values.packagingDate,
        latitude: values.latitude || undefined,
        longitude: values.longitude || undefined,
      });
      toast.success("Ghi sự kiện đóng gói thành công");
      navigate("/packaging-events");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (loadingLots) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Ghi sự kiện đóng gói</CardTitle>
        <CardDescription>
          Nhập thông tin đóng gói cho lô sản xuất đã thu hoạch.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productionLotId">Lô sản xuất *</Label>
            <Select
              value={selectedLotId || ""} // đảm bảo luôn là string
              onValueChange={(val) => {
                setSelectedLotId(val || ""); // nếu null thì set rỗng
                setValue("productionLotId", val || "");
              }}
            >
              <SelectTrigger>
                <span>
                  {selectedLotId
                    ? productionLots.find((lot) => lot.id === selectedLotId)
                        ?.name
                    : "Chọn lô đã thu hoạch"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {productionLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productionLotId && (
              <p className="text-sm text-red-500">
                {errors.productionLotId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="packagingSpecification">Quy cách đóng gói *</Label>
            <Input
              id="packagingSpecification"
              {...register("packagingSpecification")}
            />
            {errors.packagingSpecification && (
              <p className="text-sm text-red-500">
                {errors.packagingSpecification.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="packagingDate">Ngày đóng gói *</Label>
            <Input
              id="packagingDate"
              type="date"
              {...register("packagingDate")}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.packagingDate && (
              <p className="text-sm text-red-500">
                {errors.packagingDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Vị trí (click trên bản đồ)</Label>
            <div className="flex gap-2">
              <Input value={lat || ""} disabled placeholder="Vĩ độ" />
              <Input value={lng || ""} disabled placeholder="Kinh độ" />
            </div>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              height="300px"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang ghi..." : "Ghi sự kiện"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
