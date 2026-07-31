import { Package, Hash, Tag } from 'lucide-react';

interface ProductInfoProps {
  productName: string;
  shipmentCode: string;
  status: string;
}

export const ProductInfo = ({ productName, shipmentCode, status }: ProductInfoProps) => {
  const statusLabel: Record<string, string> = {
    ACTIVE: 'Đang hoạt động',
    RECALLED: 'Đã thu hồi',
    DRAFT: 'Nháp',
    CODE_PRINTED: 'Đã in mã',
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'text-green-700 bg-green-100',
    RECALLED: 'text-red-700 bg-red-100',
    DRAFT: 'text-gray-700 bg-gray-100',
    CODE_PRINTED: 'text-blue-700 bg-blue-100',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <h1 className="text-2xl font-bold text-gray-900">{productName}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Hash className="h-4 w-4" />
          <span className="font-mono">{shipmentCode}</span>
        </div>
        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[status] || 'bg-gray-100 text-gray-700'}`}>
          <Tag className="h-3 w-3" />
          {statusLabel[status] || status}
        </div>
      </div>
    </div>
  );
};