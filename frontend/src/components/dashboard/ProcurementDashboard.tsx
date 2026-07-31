import { ProductionLotBoard } from '@/components/production-lot/ProductionLotBoard';

export function ProcurementDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Thu mua nông sản
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xem danh sách lô sản xuất đã đóng gói và thực hiện ghi nhận thu mua.
        </p>
      </div>

      <ProductionLotBoard
        canCreate={false}
        canEdit={false}
        canSubmitForApproval={false}
        canApprove={false}
        canRecordFarmLog={false}
      />
    </div>
  );
}