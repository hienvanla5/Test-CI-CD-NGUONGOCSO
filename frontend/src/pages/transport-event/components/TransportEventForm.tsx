import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { recordTransportEvent } from "@/api/transportEventApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  transportEventSchema,
  type TransportEventFormValues,
} from "@/utils/validators/transportEventSchema";

import { ScanCodeField } from "./ScanCodeField";

function getCurrentDateTimeLocal() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export function TransportEventForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransportEventFormValues>({
    resolver: zodResolver(transportEventSchema),
    defaultValues: {
      codeValue: "",
      fromLocation: "",
      toLocation: "",
      transportTime: getCurrentDateTimeLocal(),
    },
  });

  const codeValue = watch("codeValue");

  const onSubmit = async (values: TransportEventFormValues) => {
    try {
      await recordTransportEvent(values);

      toast.success("Ghi sự kiện vận chuyển thành công.");

      reset({
        codeValue: "",
        fromLocation: "",
        toLocation: "",
        transportTime: getCurrentDateTimeLocal(),
      });
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ??
          (error.response
            ? "Không thể ghi sự kiện vận chuyển."
            : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.")
        : "Đã xảy ra lỗi khi ghi sự kiện vận chuyển.";

      toast.error(message);
    }
  };

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Ghi sự kiện vận chuyển</CardTitle>
        <CardDescription>
          Quét mã truy xuất của lô hàng, sau đó nhập thông tin chuyến vận
          chuyển thực tế.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <ScanCodeField
            value={codeValue}
            onChange={(value) =>
              setValue("codeValue", value, {
                shouldValidate: true,
              })
            }
            error={errors.codeValue?.message}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromLocation">Điểm đi *</Label>
              <Input
                id="fromLocation"
                placeholder="Ví dụ: Xã Long Cốc, huyện Tân Sơn, Phú Thọ"
                {...register("fromLocation")}
              />
              {errors.fromLocation && (
                <p className="text-sm text-destructive">
                  {errors.fromLocation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toLocation">Điểm đến *</Label>
              <Input
                id="toLocation"
                placeholder="Ví dụ: Kho trung chuyển Việt Trì, Phú Thọ"
                {...register("toLocation")}
              />
              {errors.toLocation && (
                <p className="text-sm text-destructive">
                  {errors.toLocation.message}
                </p>
              )}
            </div>
          </div>

          <div className="max-w-sm space-y-2">
            <Label htmlFor="transportTime">Thời gian vận chuyển *</Label>
            <Input
              id="transportTime"
              type="datetime-local"
              {...register("transportTime")}
            />
            {errors.transportTime && (
              <p className="text-sm text-destructive">
                {errors.transportTime.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Hủy
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang ghi..." : "Ghi sự kiện vận chuyển"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}