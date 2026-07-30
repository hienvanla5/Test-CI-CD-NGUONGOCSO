import { ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScanCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ScanCodeField({
  value,
  onChange,
  error,
  disabled = false,
}: ScanCodeFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="codeValue">Mã truy xuất lô hàng *</Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="codeValue"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ví dụ: HX00000029"
          autoComplete="off"
          disabled={disabled}
        />

        <Button
          type="button"
          variant="outline"
          disabled
          title="Chức năng quét camera sẽ được hoàn thiện ở bước tiếp theo."
          className="shrink-0"
        >
          <ScanLine className="mr-2 h-4 w-4" />
          Quét bằng camera
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Bạn có thể nhập mã thủ công. Nút quét QR bằng camera sẽ được phát triển
        ở ticket quét mã lô hàng.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}