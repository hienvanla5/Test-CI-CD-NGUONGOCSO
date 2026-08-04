import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOrganizationDetail } from "@/api/organizationApi";
import type { OrganizationDetailResponse } from "@/types/organization";

export function OrganizationDetail() {
  const { id } = useParams();

  const [data, setData] = useState<OrganizationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const ROLE_LABELS: Record<string, string> = {
  "VT-01": "Quản trị viên",
  "VT-02": "Quản lý hợp tác xã",
  "VT-03": "Người ghi sự kiện",
  "VT-04": "Doanh nghiệp thu mua",
  "VT-05": "Cán bộ ngành",
  "VT-06": "Người dùng hệ thống",
  };
  const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
  COOPERATIVE: "Hợp tác xã",
  ENTERPRISE: "Doanh nghiệp",
  GOVERNMENT: "Cán bộ ngành",
  SYSTEM: "Tổ chức hệ thống",
  };

  useEffect(() => {
    if (!id) return;

    getOrganizationDetail(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Đang tải...</div>;

  if (!data) return <div>Không tìm thấy tổ chức</div>;

  

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tổ chức</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">

          <div>
            <b>Mã:</b> {data.profile.code}
          </div>

          <div>
            <b>Tên:</b> {data.profile.name}
          </div>

          <div>
            <b>Loại:</b> {ORGANIZATION_TYPE_LABELS[data.profile.type] ?? data.profile.type}
          </div>

          <div>
            <b>Email:</b> {data.profile.email}
          </div>

          <div>
            <b>SĐT:</b> {data.profile.phone}
          </div>

          <div>
            <b>Địa chỉ:</b> {data.profile.address}
          </div>

          <div>
            <b>Trạng thái:</b>

            <Badge className="ml-2">
              {data.profile.status}
            </Badge>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Tài khoản</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {data.members.map((m) => (

                <TableRow key={m.id}>

                  <TableCell>{m.username}</TableCell>

                  <TableCell>{m.fullName}</TableCell>

                  <TableCell>{m.email}</TableCell>

                  <TableCell>
                    {ROLE_LABELS[m.roleCode] ?? m.roleName}
                  </TableCell>

                  <TableCell>{m.status}</TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
}