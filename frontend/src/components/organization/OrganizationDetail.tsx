import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOrganizationDetail } from "@/api/organizationApi";
import { createOrganizationMember } from "@/api/organizationApi";
import type { OrganizationDetailResponse } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { AddMemberRequest } from "@/types/organization";
import { CreateOrganizationMemberForm, type CreateOrganizationMemberFormData } from "./CreateOrganizationMemberFrom";
import { toast } from "sonner";
import { getRoleLabel } from "@/config/roleAccess";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


export function OrganizationDetail() {
    const { id } = useParams();

    const [data, setData] = useState<OrganizationDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const handleCreateMember = async (values: CreateOrganizationMemberFormData) => {
        if (!id) return;

        const payload: AddMemberRequest = {
            username: values.username,
            password: values.password,
            fullName: values.fullName,
            phone: values.phone?.trim() ? values.phone.trim() : undefined,
            email: values.email?.trim() ? values.email.trim() : undefined,
            roleId: values.roleId,
        };

        try {
            setSubmitting(true);
            await createOrganizationMember(id, payload);
            const refreshed = await getOrganizationDetail(id);
            setData(refreshed);
            setOpenCreate(false);
            toast.success("Thêm tài khoản thành công");
        } catch (error: any) {
            const message = error?.response?.data?.message || "Không thể thêm tài khoản";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Danh sách tài khoản</CardTitle>

                    <Button onClick={() => setOpenCreate(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm tài khoản
                    </Button>
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
                                        {m.roleCode ? getRoleLabel(m.roleCode) : m.roleName}
                                    </TableCell>

                                    <TableCell>{m.status}</TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </CardContent>

            </Card>

            <Dialog
                open={openCreate}
                onOpenChange={setOpenCreate}
            >
                <DialogContent className="max-w-6xl w-full p-8 max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-4 mb-4">
                        <DialogTitle className="text-2xl font-bold">Thêm tài khoản mới</DialogTitle>
                    </DialogHeader>

                    <CreateOrganizationMemberForm
                        onSubmit={handleCreateMember}
                        loading={submitting}
                        organizationType={data.profile.type}
                    />
                </DialogContent>
            </Dialog>

        </div>
    );
}