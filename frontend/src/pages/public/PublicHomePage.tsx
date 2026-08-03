import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import { LogIn, QrCode, ScanLine, Sprout } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function PublicHomePage() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [code, setCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  // Nếu user đã đăng nhập, chuyển hướng vào dashboard nội bộ
  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setIsScanning(false);
  };

  const startScanner = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Trình duyệt không hỗ trợ camera");
      return;
    }

    setIsScanning(true);
  };

  useEffect(() => {
    if (!isScanning) return;

    let isActive = true;
    const codeReader = new BrowserQRCodeReader();

    const startScanning = async () => {
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 150));

        const video = videoRef.current;
        if (!video) {
          throw new Error("Không tìm thấy vùng hiển thị camera.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;

        const controls = await codeReader.decodeFromVideoElement(
          video,
          (result) => {
            if (!result || !isActive) return;

            // Trích xuất codeValue từ nội dung QR
            let codeValue = result.getText();
            if (codeValue.includes("/public/trace/")) {
              codeValue = codeValue.split("/public/trace/")[1];
            }

            if (!codeValue) {
              toast.error("Mã QR không hợp lệ");
              return;
            }

            toast.success("Đã quét mã tra cứu.");
            controls.stop();
            stream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            controlsRef.current = null;
            setIsScanning(false);
            navigate(`/public/trace/${codeValue}`);
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
          toast.error("Bạn chưa cho phép dùng camera. Hãy cấp quyền camera rồi thử lại.");
          return;
        }

        if (
          scanError instanceof DOMException &&
          scanError.name === "NotReadableError"
        ) {
          toast.error("Camera đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó rồi thử lại.");
          return;
        }

        toast.error("Không thể mở camera. Hãy kiểm tra camera hoặc nhập mã thủ công.");
      } finally {
        if (!isActive) return;
        if (!controlsRef.current) {
          setIsScanning(false);
        }
      }
    };

    void startScanning();

    return () => {
      isActive = false;
      controlsRef.current?.stop();
      controlsRef.current = null;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [isScanning, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã tra cứu");
      return;
    }
    navigate(`/public/trace/${code.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-4 py-10 relative">
      {/* Nút Đăng nhập – góc trên phải */}
      {!isAuthLoading && !user && (
        <Button
          variant="outline"
          className="absolute top-4 right-4 gap-2"
          onClick={() => navigate("/login")}
        >
          <LogIn className="h-4 w-4" />
          Đăng nhập
        </Button>
      )}

      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo & Title */}
        <div className="space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Sprout className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-700">Nguồn gốc số</h1>
          <p className="text-muted-foreground text-sm">
            Tra cứu hành trình sản phẩm nông sản
          </p>
        </div>

        {/* QR Scanner Container */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {isScanning ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg bg-black">
                <video
                  ref={videoRef}
                  className="w-full aspect-square object-cover"
                  muted
                  playsInline
                />
              </div>
              <Button
                variant="outline"
                onClick={stopScanner}
                className="w-full"
              >
                Hủy quét
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={startScanner}
                className="w-full h-14 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <ScanLine className="h-5 w-5" />
                Quét mã QR
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Hoặc nhập mã
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập mã tra cứu"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <QrCode className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nguồn gốc số – Thông tin minh bạch từ
          nông trại đến bàn ăn
        </p>
      </div>
    </div>
  );
}