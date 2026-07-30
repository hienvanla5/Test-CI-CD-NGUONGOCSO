import { useParams, useNavigate } from 'react-router-dom';
import { FarmLogList } from '@/components/farm-log/FarmLogList';

export default function FarmLogHistoryPage() {
  const { productionLotId } = useParams<{ productionLotId: string }>();
  const navigate = useNavigate();

  if (!productionLotId) {
    return <div>Không tìm thấy ID lô sản xuất</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <FarmLogList
        productionLotId={productionLotId}
        onBack={() => navigate(-1)}
      />
    </div>
  );
}