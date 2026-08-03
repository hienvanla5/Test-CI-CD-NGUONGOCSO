import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import { isAxiosError } from "axios";
import {
  Camera,
  CheckCircle2,
  RefreshCw,
  ScanLine,
  TriangleAlert,
} from "lucide-react";

import { scanLookupTraceCode } from "@/api/chainEventApi";
import type { ScanLookupResponse } from "@/types/scan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LookupState =
  | { step: "scanning" }
  | { step: "camera-error"; message: string }
  | { step: "looking-up"; code: string }
  | { step: "result"; data: ScanLookupResponse }
  | { step: "blocked"; code: number; message: string };

const EVENT_TYPE_LABELS: Record<string, string> = {
  HARVEST: "Thu hoạch",
  TRANSPORT: "Vận chuyển",
  PACKAGING: "Đóng gói",
  PURCHASE: "Thu mua",
};

function eventTypeLabel(type: string) {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export default function ScanQuickEventPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [state, setState] = useState<LookupState>({ step: "scanning" });

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const handleLookup = async (code: string) => {
    stopCamera();
    setState({ step: "looking-up", code });

    try {
      const data = await scanLookupTraceCode(code);
      setState({ step: "result", data });
    } catch (error: unknown) {
      if (isAxiosError<{ status?: number; message?: string }>(error)) {
        const status = error.response?.status ?? 0;
        const message =
          error.response?.data?.message ??
          "Không thể tra cứu mã truy xuất. Vui lòng thử lại.";
        setState({ step: "blocked", code: status, message });
      } else {
        setState({
          step: "blocked",
          code: 0,
          message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.",
        });
      }
    }
  };

  const restartScanning = () => {
    setState({ step: "scanning" });
  };

  useEffect(() => {
    if (state.step !== "scanning") return;

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
            void handleLookup(result.getText());
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
          setState({
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
          setState({
            step: "camera-error",
            message:
              "Camera đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.",
          });
          return;
        }
        setState({
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
  }, [state.step]);

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
        {(state.step === "scanning" || state.step === "camera-error") && (
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
            {state.step === "camera-error" && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p>{state.message}</p>
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

        {state.step === "looking-up" && (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center text-muted-foreground">
            <Camera className="h-8 w-8 animate-pulse" />
            <p>Đang tra cứu mã "{state.code}"...</p>
          </div>
        )}

        {state.step === "blocked" && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-3">
              <p className="font-semibold">
                {state.code === 409
                  ? "Lô hàng đã bị thu hồi"
                  : state.code === 403
                    ? "Không có quyền"
                    : "Mã không hợp lệ"}
              </p>
              <p>{state.message}</p>
              {state.code !== 403 && (
                <Button size="sm" variant="outline" onClick={restartScanning}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Quét lại
                </Button>
              )}
            </div>
          </div>
        )}

        {state.step === "result" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Đã xác định lô hàng. Chọn loại sự kiện để ghi tiếp.</p>
            </div>

            <dl className="divide-y rounded-lg border bg-slate-50 px-4">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Lô hàng</dt>
                <dd className="text-right text-sm font-semibold">
                  {state.data.shipmentName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Loại nông sản</dt>
                <dd className="text-right text-sm font-semibold">
                  {state.data.productCategoryName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Vùng trồng</dt>
                <dd className="text-right text-sm font-semibold">
                  {state.data.farmAreaName}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Tổ chức</dt>
                <dd className="text-right text-sm font-semibold">
                  {state.data.organizationName}
                </dd>
              </div>
              {state.data.lastEventType && (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-sm text-muted-foreground">
                    Sự kiện gần nhất
                  </dt>
                  <dd className="text-right text-sm font-semibold">
                    {eventTypeLabel(state.data.lastEventType)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ghi sự kiện tiếp theo</p>
              <div className="flex flex-wrap gap-2">
                {state.data.allowedEventTypes.map((type) =>
                  type === "TRANSPORT" ? (
                    <Button
                      key={type}
                      size="sm"
                      onClick={() =>
                        navigate("/transport-events/record", {
                          state: { codeValue: state.data.traceCode },
                        })
                      }
                    >
                      Ghi sự kiện vận chuyển
                    </Button>
                  ) : (
                    <Badge key={type} variant="outline">
                      {eventTypeLabel(type)}
                    </Badge>
                  ),
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Các loại sự kiện hiện chưa hỗ trợ mở nhanh từ đây sẽ được bổ
                sung sau; hiện chỉ hiển thị để tham khảo.
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