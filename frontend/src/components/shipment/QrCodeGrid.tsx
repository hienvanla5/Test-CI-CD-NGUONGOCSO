import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Download, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import type { TraceCode } from '@/types/shipment';

interface QrCodeGridProps {
  traceCodes: TraceCode[];
  // Ảnh QR là tài nguyên tĩnh, KHÔNG nằm dưới tiền tố /api/v1 của API,
  // nên phải dùng biến base URL riêng cho asset tĩnh (mặc định là gốc domain của backend).
  baseUrl?: string;
}

export const QrCodeGrid = ({
  traceCodes,
  baseUrl = import.meta.env.VITE_ASSET_BASE_URL || 'http://localhost:8080',
}: QrCodeGridProps) => {
  const resolveUrl = (imageUrl: string) =>
    imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;

  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const markFailed = (id: string) =>
    setFailedIds((prev) => new Set(prev).add(id));

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => toast.success('Đã sao chép mã'),
      () => toast.error('Sao chép thất bại')
    );
  };

  const handleDownload = async (code: string, imageUrl: string) => {
    const fullUrl = resolveUrl(imageUrl);
    try {
      // Trình duyệt bỏ qua thuộc tính `download` với ảnh khác origin,
      // nên phải fetch về dạng blob rồi tạo object URL mới tải được đúng file.
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Tải mã QR thất bại');
    }
  };

  if (!traceCodes || traceCodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có mã QR nào.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {traceCodes.map((code) => {
        const qrFullUrl = code.qrImage ? resolveUrl(code.qrImage) : '';
        const hasFailed = !code.qrImage || failedIds.has(code.id);
        return (
          <Card key={code.id} className="overflow-hidden">
            <CardContent className="p-4 text-center">
              {hasFailed ? (
                <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center gap-1 rounded bg-muted text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                  <span className="text-[10px]">Lỗi tải ảnh</span>
                </div>
              ) : (
                <img
                  src={qrFullUrl}
                  alt={`QR ${code.codeValue}`}
                  className="w-24 h-24 mx-auto object-contain"
                  onError={() => markFailed(code.id)}
                />
              )}
              <p className="mt-2 font-mono text-xs font-medium">{code.codeValue}</p>
              <p className="text-xs text-muted-foreground">{code.status}</p>
              <div className="mt-2 flex justify-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleCopyCode(code.codeValue)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!code.qrImage}
                  onClick={() => code.qrImage && handleDownload(code.codeValue, code.qrImage)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};