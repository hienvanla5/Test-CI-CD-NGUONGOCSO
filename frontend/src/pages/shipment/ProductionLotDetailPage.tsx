import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sprout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getProductionLotById } from "@/api/productionLotApi";
import { ShipmentList } from "@/components/shipment/ShipmentList";
import { FarmLogList } from "@/components/farm-log/FarmLogList";
import { HarvestForm } from "@/components/trace-event/HarvestForm";
import type { ProductionLot } from "@/types/productionLot";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const ProductionLotDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lot, setLot] = useState<ProductionLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHarvestForm, setShowHarvestForm] = useState(false);

  const loadLot = async () => {
    if (!id) return;
    try {
      const data = await getProductionLotById(id);
      setLot(data);
    } catch (error) {
      toast.error("Không thể tải thông tin lô sản xuất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLot();
  }, [id]);

  const canRecordHarvest =
    user?.roleCode === "VT-02" || user?.roleCode === "VT-03";

  if (loading) {
    return <div className="flex justify-center p-12">Đang tải...</div>;
  }

  if (!lot) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Không tìm thấy lô sản xuất
      </div>
    );
  }

  const canCreateShipment =
    user?.roleCode === "VT-02" && lot.status === "PACKAGED";
  const canActivateShipment = user?.roleCode === "VT-02";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        {canRecordHarvest && lot.status === "APPROVED" && !showHarvestForm && (
          <Button
            onClick={() => setShowHarvestForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sprout className="h-4 w-4 mr-1" />
            Ghi nhận thu hoạch
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chi tiết lô sản xuất</CardTitle>
            <Badge
              variant="default"
              className={
                lot.status === "APPROVED"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : ""
              }
            >
              {lot.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Tên lô
              </dt>
              <dd className="text-base font-semibold">{lot.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </dt>
              <dd className="text-base">{lot.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Sản lượng dự kiến
              </dt>
              <dd className="text-base">
                {lot.expectedQuantity} {lot.expectedQuantityUnit}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Sản lượng thực tế
              </dt>
              <dd className="text-base">
                {lot.actualQuantity ? `${lot.actualQuantity} kg` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Ngày trồng
              </dt>
              <dd className="text-base">
                {lot.plantingDate
                  ? new Date(lot.plantingDate).toLocaleDateString("vi-VN")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Ngày thu hoạch
              </dt>
              <dd className="text-base">
                {lot.harvestDate
                  ? new Date(lot.harvestDate).toLocaleDateString("vi-VN")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Vùng trồng
              </dt>
              <dd className="text-base">{lot.farmAreaName || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Nông sản
              </dt>
              <dd className="text-base">{lot.productCategoryName || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {showHarvestForm && (
        <HarvestForm
          productionLotId={lot.id}
          productionLotName={lot.name}
          onSuccess={() => {
            setShowHarvestForm(false);
            loadLot();
          }}
          onCancel={() => setShowHarvestForm(false)}
        />
      )}

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Thông tin chung</TabsTrigger>
          <TabsTrigger value="farmlogs">Nhật ký canh tác</TabsTrigger>
          <TabsTrigger value="shipments">Lô hàng & Mã QR</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    ID
                  </dt>
                  <dd className="text-sm font-mono">{lot.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </dt>
                  <dd className="text-sm">
                    {new Date(lot.createdAt).toLocaleString("vi-VN")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Người tạo
                  </dt>
                  <dd className="text-sm">{lot.createdByName || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="farmlogs" className="mt-4">
          <FarmLogList productionLotId={lot.id} productionLotName={lot.name} />
        </TabsContent>
        <TabsContent value="shipments" className="mt-4">
          <ShipmentList
            productionLotId={lot.id}
            productionLotStatus={lot.status}
            canCreate={canCreateShipment}
            canActivate={canActivateShipment}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};