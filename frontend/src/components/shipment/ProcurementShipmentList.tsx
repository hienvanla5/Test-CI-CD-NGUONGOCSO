import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProcurementShipment } from "@/types/shipment";
import { getEligibleShipments } from "@/api/shipmentApi";
import {
  LoaderCircle,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ProcurementShipmentListProps {
  /** Callback khi người dùng bấm "Ghi nhận thu mua" trên một lô hàng */
  onRecordProcurement: (shipmentId: string) => void;
}

const statusLabels: Record<string, string> = {
  ACTIVATED: "Đã kích hoạt",
  CODE_PRINTED: "Đã in mã",
  DRAFT: "Bản nháp",
  RECALLED: "Đã thu hồi",
};

const statusClasses: Record<string, string> = {
  ACTIVATED: "bg-emerald-100 text-emerald-700",
  CODE_PRINTED: "bg-blue-100 text-blue-700",
  DRAFT: "bg-slate-100 text-slate-700",
  RECALLED: "bg-red-100 text-red-700",
};

export function ProcurementShipmentList({
  onRecordProcurement,
}: ProcurementShipmentListProps) {
  const [shipments, setShipments] = useState<ProcurementShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadShipments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEligibleShipments();
      setShipments(data);
    } catch {
      toast.error("Không thể tải danh sách lô hàng thu mua.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return shipments;

    return shipments.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        (s.productionLotName ?? "").toLowerCase().includes(keyword) ||
        (s.productCategoryName ?? "").toLowerCase().includes(keyword),
    );
  }, [shipments, search]);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Danh sách lô hàng sẵn sàng thu mua</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Chỉ hiển thị các lô hàng đã kích hoạt tem, sẵn sàng ghi nhận thu
              mua.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Search bar */}
        <div className="border-b bg-slate-50/70 p-4">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="bg-white pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên lô hàng, lô sản xuất hoặc loại nông sản..."
              aria-label="Tìm kiếm lô hàng thu mua"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Tên lô hàng",
                  "Lô sản xuất",
                  "Nông sản",
                  "Sản lượng",
                  "Trạng thái",
                  "Thao tác",
                ].map((title) => (
                  <th className="px-4 py-3 font-semibold" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-slate-500"
                    colSpan={6}
                  >
                    <LoaderCircle className="mx-auto mb-2 size-5 animate-spin" />
                    Đang tải danh sách lô hàng...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((shipment) => (
                  <tr
                    className="border-t hover:bg-emerald-50/30"
                    key={shipment.id}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {shipment.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {shipment.productionLotName ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {shipment.productCategoryName ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {shipment.totalQuantity != null
                        ? shipment.totalQuantity.toLocaleString("vi-VN")
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClasses[shipment.status] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabels[shipment.status] ?? shipment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => onRecordProcurement(shipment.id)}
                      >
                        <ShoppingCart className="size-4" />
                        Ghi nhận thu mua
                      </Button>
                    </td>
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-slate-500"
                    colSpan={6}
                  >
                    <Package className="mx-auto mb-3 size-10 text-slate-300" />
                    <p className="font-semibold">
                      {search.trim()
                        ? "Không tìm thấy lô hàng phù hợp"
                        : "Chưa có lô hàng nào sẵn sàng thu mua"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {search.trim()
                        ? "Hãy thử thay đổi từ khóa tìm kiếm."
                        : "Các lô hàng đã kích hoạt tem sẽ xuất hiện tại đây."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}