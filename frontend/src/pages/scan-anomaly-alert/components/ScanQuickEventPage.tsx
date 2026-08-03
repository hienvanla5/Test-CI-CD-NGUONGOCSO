import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  ScanLine,
  TriangleAlert,
} from "lucide-react";

import { useScanLookup } from "@/hooks/useScanLookup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CameraState =
  | { step: "scanning" }
  | { step: "camera-error"; message: string }
  | { step: "ready" };

const EVENT_TYPE_LABELS: Record<string, string> = {
  HARVEST: "Thu hoạch",
  TRANSPORT: "Vận chuyển",
  PACKAGING: "Đóng gói",
  PROCUREMENT: "Thu mua",
};

function eventTypeLabel(type: string) {
  return EVENT_TYPE_LABELS[type] ?? type;
}

// Mỗi loại sự kiện, nếu có thể mở nhanh biểu mẫu ghi tiếp từ đây, sẽ khai báo
// route đích + nhãn nút. Loại sự kiện không có trong danh sách này (VD:
// PROCUREMENT thuộc quyền VT-04, HARVEST không có route mở nhanh) chỉ hiển
// thị dạng nhãn tham khảo, không thể bấm — vì trang quét mã chỉ dành cho
// VT-03 và VT-03 không có quyền mở các biểu mẫu đó.
const EVENT_TYPE_ROUTES: Record<
  string,
  { path: string; label: string }
> = {
  TRANSPORT: { path: "/transport-events/record", label: "Ghi sự kiện vận chuyển" },
  PACKAGING: { path: "/packaging-events/create", label: "Ghi sự kiện đóng gói" },
};

export default function ScanQuickEventPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const hasHandledResultRef = useRef(false);

  const [cameraState, setCameraState] = useState<CameraState>({
    step: "scanning",
  });
  const { data, isLoading, error, lookup, reset } = useScanLookup();

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleDetectedCode = (code: string) => {
    if (hasHandledResultRef.current) return;
    hasHandledResultRef.current = true;
    stopCamera();
    void lookup(code);
  };

  const restartScanning = () => {
    hasHandledResultRef.current = false;
    reset();
    setCameraState({ step: "scanning" });
  };

  useEffect(() => {
    if (cameraState.step !== "scanning") return;

    let isActive = true;
    const codeReader = new BrowserQRCodeReader();

    const start = async () => {
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 150));

        const video = videoRef.current;
        if (!video) throw new Error("Không tìm thấy vùng hiển thị camera.");

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        const controls = await codeReader.decodeFromVideoElement(
          video,
          (result) => {
            if (!result || !isActive) return;
            handleDetectedCode(result.getText());
          },
        );

        if (!isActive) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (scanError: unknown) {
        if (!isActive) return;

        if (
          scanError instanceof DOMException &&
          scanError.name === "NotAllowedError"
        ) {
          setCameraState({
            step: "camera-error",
            message:
              "Bạn chưa cho phép dùng camera. Hãy cấp quyền camera rồi thử lại.",
          });
          return;
        }
        if (
          scanError instanceof DOMException &&
          scanError.name === "NotReadableError"
        ) {
          setCameraState({
            step: "camera-error",
            message:
              "Camera đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.",
          });
          return;
        }
        setCameraState({
          step: "camera-error",
          message: "Không thể mở camera. Hãy kiểm tra camera rồi thử lại.",
        });
      }
    };

    void start();

    return () => {
      isActive = false;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraState.step]);

  const showCamera =
    !data && !error && !isLoading &&
    (cameraState.step === "scanning" || cameraState.step === "camera-error");

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-5 w-5" />
          Quét mã ghi sự kiện nhanh
        </CardTitle>
        <CardDescription>
          Đưa mã QR/barcode in trên bao bì lô hàng vào khung hình. Hệ thống sẽ
          tự xác định lô hàng và mở nhanh biểu mẫu ghi sự kiện phù hợp.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {showCamera && (
          <>
            <div className="overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                autoPlay
                muted
                playsInline
              />
            </div>
            {cameraState.step === "camera-error" && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p>{cameraState.message}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={restartScanning}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Thử lại
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center text-muted-foreground">
            <Camera className="h-8 w-8 animate-pulse" />
            <p>Đang tra cứu mã...</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-3">
              <p className="font-semibold">
                {error.code === "RECALLED"
                  ? "Lô hàng đã bị thu hồi"
                  : error.code === "FORBIDDEN_ROLE"
                    ? "Không có quyền"
                    : error.code === "FORBIDDEN_ORG"
                      ? "Không thuộc tổ chức sở hữu lô hàng"
                      : error.code === "NETWORK"
                        ? "Lỗi kết nối"
                        : "Mã không hợp lệ"}
              </p>
              <p>{error.message}</p>
              {error.code !== "FORBIDDEN_ROLE" && (
                <Button size="sm" variant="outline" onClick={restartScanning}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Quét lại
                </Button>
              )}
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Đã xác định lô hàng. Chọn loại sự kiện để ghi tiếp.</p>
            </div>

            <dl className="divide-y rounded-lg border bg-slate-50 px-4">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Lô hàng</dt>
                <dd className="text-right text-sm font-semibold">
                  {data.shipmentName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Loại nông sản</dt>
                <dd className="text-right text-sm font-semibold">
                  {data.productCategoryName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Vùng trồng</dt>
                <dd className="text-right text-sm font-semibold">
                  {data.farmAreaName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Tổ chức</dt>
                <dd className="text-right text-sm font-semibold">
                  {data.organizationName}
                </dd>
              </div>
              {data.lastEventType && (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-sm text-muted-foreground">
                    Sự kiện gần nhất
                  </dt>
                  <dd className="text-right text-sm font-semibold">
                    {eventTypeLabel(data.lastEventType)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ghi sự kiện tiếp theo</p>
              <div className="flex flex-wrap gap-2">
                {data.allowedEventTypes.map((type) => {
                  const route = EVENT_TYPE_ROUTES[type];
                  return route ? (
                    <Button
                      key={type}
                      size="sm"
                      onClick={() =>
                        navigate(route.path, {
                          state: {
                            codeValue: data.traceCode,
                            productionLotId: data.productionLotId,
                          },
                        })
                      }
                    >
                      {route.label}
                    </Button>
                  ) : (
                    <Badge key={type} variant="outline">
                      {eventTypeLabel(type)}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Các loại sự kiện hiện chưa hỗ trợ mở nhanh từ đây (hoặc không
                thuộc quyền của bạn) sẽ chỉ hiển thị để tham khảo.
              </p>
            </div>

            <Button variant="outline" onClick={restartScanning}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Quét mã khác
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}