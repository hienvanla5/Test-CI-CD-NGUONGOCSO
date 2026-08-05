import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface Props {
  onFilter: (params: any) => void;
  onReset: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Đã ẩn" },
];

export const ProductCategoryFilter = ({
  onFilter,
  onReset,
  loading,
}: Props) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (name) params.name = name;
    if (group) params.categoryGroup = group;
    if (isActive !== undefined) params.isActive = isActive;
    onFilter(params);
  };

  const handleReset = () => {
    setName("");
    setGroup("");
    setIsActive(undefined);
    onReset();
  };

  const selectedLabel =
    STATUS_OPTIONS.find((opt) => opt.value === String(isActive ?? ""))?.label ||
    "Tất cả";

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Tên loại nông sản</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tìm theo tên..."
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="group">Nhóm hàng</Label>
              <Input
                id="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="VD: Cây ăn quả"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={isActive !== undefined ? String(isActive) : ""}
                onValueChange={(val) =>
                  setIsActive(val === "" ? undefined : val === "true")
                }
              >
              <SelectTrigger size="sm" className="w-full">
                  <span>{selectedLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="invisible">Thao tác</Label>
              <div className="flex gap-2">
                <Button type="submit" variant="search" disabled={loading}>
                  <Search className="h-4 w-4 mr-1" /> Tìm kiếm
                </Button>
                <Button
                  type="button"
                  variant="delete"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" /> Xóa
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};