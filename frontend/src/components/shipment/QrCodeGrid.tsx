import {Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { TraceCode } from '@/types/shipment';

interface QrCodeGridProps {
  traceCodes: TraceCode[];
  baseUrl?: string;
}

export const QrCodeGrid = ({ traceCodes, baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1' }: QrCodeGridProps) => {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => toast.success('Đã sao chép mã'),
      () => toast.error('Sao chép thất bại')
    );
  };

  const handleDownload = (code: string, imageUrl: string) => {
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (traceCodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có mã QR nào.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {traceCodes.map((code) => {
        const qrFullUrl = code.qrImage.startsWith('http')
          ? code.qrImage
          : `${baseUrl}${code.qrImage}`;
        return (
          <Card key={code.id} className="overflow-hidden">
            <CardContent className="p-4 text-center">
              <img
                src={qrFullUrl}
                alt={`QR ${code.codeValue}`}
                className="w-24 h-24 mx-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
                }}
              />
              <p className="mt-2 font-mono text-xs font-medium">{code.codeValue}</p>
              <p className="text-xs text-muted-foreground">{code.status}</p>
              <div className="mt-2 flex justify-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(code.codeValue)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(code.codeValue, code.qrImage)}
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