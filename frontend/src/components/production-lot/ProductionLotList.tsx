import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductionLot } from "@/types/productionLot";
import {
  ClipboardCheck,
  LoaderCircle,
  NotebookPen,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApproveProductionLotDialog } from "./Approveproductionlotdialog";

interface ProductionLotListProps {
  lots: ProductionLot[];
  isLoading: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canSubmitForApproval: boolean;
  canApprove: boolean;
  canRecordFarmLog: boolean;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onSubmitForApproval: (id: string) => Promise<void>;
  onDecideApproval: (
    id: string,
    approved: boolean,
    reason?: string,
  ) => Promise<void>;
  onRecordFarmLog: (id: string) => void;
  onRecordProcurement?: (lotId: string) => void;
}

const statusLabels: Record<ProductionLot["status"], string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  HARVESTED: "Đã thu hoạch",
  PACKAGED: "Đã đóng gói",
  CLOSED: "Đã kết thúc",
};

const statusClasses: Record<ProductionLot["status"], string> = {
  DRAFT: "bg-status-draft/10 text-status-draft",
  PENDING: "bg-status-pending/10 text-status-pending",
  APPROVED: "bg-status-approved/10 text-status-approved",
  REJECTED: "bg-status-rejected/10 text-status-rejected",
  HARVESTED: "bg-status-harvested/10 text-status-harvested",
  PACKAGED: "bg-status-packaged/10 text-status-packaged",
  CLOSED: "bg-status-completed/10 text-status-completed",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN").format(
    new Date(`${value}T00:00:00`),
  );
};

export const ProductionLotList = ({
  lots,
  isLoading,
  canCreate,
  canEdit,
  canSubmitForApproval,
  canApprove,
  canRecordFarmLog,
  onCreate,
  onEdit,
  onSubmitForApproval,
  onDecideApproval,
  onRecordFarmLog,
  onRecordProcurement,
}: ProductionLotListProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [confirmingLot, setConfirmingLot] =
    useState<ProductionLot | null>(null);
  const [approvingLot, setApprovingLot] =
    useState<ProductionLot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmSubmit = async () => {
    if (!confirmingLot) return;

    setIsSubmitting(true);
    try {
      await onSubmitForApproval(confirmingLot.id);
      setConfirmingLot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLots = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return lots.filter((lot) => {
      const matchesSearch =
        !keyword ||
        [
          lot.name,
          lot.farmAreaName ?? "",
          lot.productCategoryName ?? "",
        ].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus =
        statusFilter === "ALL" || lot.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [lots, search, statusFilter]);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Danh sách lô sản xuất</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi lô theo vùng trồng, nông sản và trạng thái xử lý.
              </p>
            </div>

            {canCreate && (
              <Button type="button" onClick={onCreate}>
                <Plus className="size-4" />
                Tạo lô sản xuất
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid gap-3 border-b bg-table-header p-4 md:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="bg-white pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên lô, vùng trồng hoặc loại nông sản..."
                aria-label="Tìm kiếm lô sản xuất"
              />
            </label>

            <select
              className="h-11 rounded-lg border border-input bg-white px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1180px]">
              <TableHeader>
                <TableRow>
                  {[
                    "Tên lô",
                    "Vùng trồng",
                    "Nông sản",
                    "Sản lượng dự kiến",
                    "Ngày gieo trồng",
                    "Trạng thái",
                    "Thao tác",
                    "Chi tiết",
                  ].map((title) => (
                    <TableHead key={title}>{title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Đang tải danh sách lô sản xuất...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  filteredLots.map((lot) => {
                    const showEdit =
                      canEdit && lot.status === "DRAFT";
                    const showApprove =
                      canApprove && lot.status === "PENDING";
                    const showRecordFarmLog =
                      canRecordFarmLog &&
                      (lot.status === "APPROVED" ||
                        lot.status === "HARVESTED");
                    const showRecordProcurement =
                      !!onRecordProcurement &&
                      lot.status === "PACKAGED";
                    const hasAction =
                      showEdit ||
                      showApprove ||
                      showRecordFarmLog ||
                      showRecordProcurement;

                    return (
                      <TableRow key={lot.id}>
                        <TableCell className="font-semibold text-foreground">
                          {lot.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lot.farmAreaName ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lot.productCategoryName ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lot.expectedQuantity.toLocaleString("vi-VN")}{" "}
                          {lot.expectedQuantityUnit || ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(lot.plantingDate)}
                        </TableCell>

                        <TableCell>
                          {canSubmitForApproval &&
                          lot.status === "DRAFT" ? (
                            <button
                              type="button"
                              onClick={() => setConfirmingLot(lot)}
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-75 ${statusClasses[lot.status]}`}
                              title="Nhấn để gửi duyệt"
                            >
                              {statusLabels[lot.status]}
                            </button>
                          ) : (
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[lot.status]}`}
                            >
                              {statusLabels[lot.status]}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {showEdit && (
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => onEdit(lot.id)}
                              >
                                <Pencil className="size-4" />
                                Chỉnh sửa
                              </Button>
                            )}

                            {showApprove && (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => setApprovingLot(lot)}
                              >
                                <ClipboardCheck className="size-4" />
                                Duyệt lô
                              </Button>
                            )}

                            {showRecordFarmLog && (
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => onRecordFarmLog(lot.id)}
                              >
                                <NotebookPen className="size-4" />
                                Ghi nhật ký
                              </Button>
                            )}

                            {showRecordProcurement && (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() =>
                                  onRecordProcurement?.(lot.id)
                                }
                              >
                                <ShoppingCart className="size-4" />
                                Ghi nhận thu mua
                              </Button>
                            )}

                            {!hasAction && (
                              <span className="text-muted-foreground">
                                —
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() =>
                              navigate(`/production-lots/${lot.id}`)
                            }
                          >
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            {!isLoading && !filteredLots.length && (
              <div className="grid place-items-center px-4 py-16 text-center">
                <PackageOpen className="mb-3 size-10 text-muted-foreground/40" />
                <p className="font-semibold">
                  Không tìm thấy lô sản xuất
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmingLot !== null}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setConfirmingLot(null);
          }
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi duyệt lô sản xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp gửi duyệt lô{" "}
              <span className="font-semibold text-foreground">
                {confirmingLot?.name}
              </span>
              . Tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Hủy
            </AlertDialogCancel>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void handleConfirmSubmit();
              }}
            >
              {isSubmitting && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <ApproveProductionLotDialog
        open={approvingLot !== null}
        lot={approvingLot}
        onClose={() => setApprovingLot(null)}
        onDecide={onDecideApproval}
      />
    </>
  );
};