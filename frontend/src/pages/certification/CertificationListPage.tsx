import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CertificationList } from '@/components/certification/CertificationList';
import { getAllCertifications } from '@/api/certificationApi';
import type { CertificationResponse } from '@/types/certification';

// Hàm chuyển đổi CertificationResponse sang ProductionLotCertification (tạm thời)
// Vì CertificationList chỉ nhận ProductionLotCertification
const toProductionLotCertification = (cert: CertificationResponse): any => ({
  id: cert.id,
  certificationId: cert.id,
  certificationName: cert.name,
  certificationCode: cert.code,
  issuedBy: cert.issuedBy,
  issueDate: cert.issueDate,
  expiryDate: cert.expiryDate,
  isValid: cert.isValid,
  attachedAt: new Date().toISOString(),
  attachedBy: '',
  note: '',
});

const CertificationListPage: React.FC = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAllCertifications();
        setCertifications(data.map(toProductionLotCertification));
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể tải danh sách chứng nhận');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý chứng nhận</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách các chứng nhận đã đính kèm cho tổ chức của bạn.
        </p>
      </div>
      <CertificationList
        certifications={certifications}
        onDetach={() => {}} // không có chức năng gỡ ở đây
        canManage={false}
        loading={loading}
      />
    </div>
  );
};

export default CertificationListPage;