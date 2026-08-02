import React from 'react';
import { CertificationList } from '@/components/certification/CertificationList';

const CertificationListPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý chứng nhận</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách các chứng nhận đã đính kèm cho tổ chức của bạn.
        </p>
      </div>
      <CertificationList />
    </div>
  );
};

export default CertificationListPage;