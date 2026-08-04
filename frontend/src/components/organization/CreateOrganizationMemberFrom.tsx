import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface CreateOrganizationMemberFormData {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    roleId: number;
}

interface Props {
    onSubmit: (data: CreateOrganizationMemberFormData) => void;
    loading?: boolean;
}

const ROLE_OPTIONS = [
    {
        id: 2,
        code: "VT-02",
        name: "Quản lý hợp tác xã",
    },
    {
        id: 3,
        code: "VT-03",
        name: "Người ghi sự kiện",
    },
    {
        id: 4,
        code: "VT-04",
        name: "Doanh nghiệp thu mua",
    },
    {
        id: 5,
        code: "VT-05",
        name: "Cán bộ ngành",
    },
    {
        id: 6,
        code: "VT-06",
        name: "Người dùng",
    },
];

export function CreateOrganizationMemberForm({
    onSubmit,
    loading = false,
}: Props) {
    const { register, handleSubmit, setValue, watch } =
        useForm<CreateOrganizationMemberFormData>({
            defaultValues: {
                username: "",
                password: "",
                fullName: "",
                email: "",
                phone: "",
                roleId: 3,
            },
        });

    return (
        <form
            className="space-y-8"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <Label className="block text-base font-medium mb-1">Tên đăng nhập</Label>
                    <Input
                        className="w-full h-11 text-base"
                        {...register("username", {
                            required: true,
                        })}
                    />
                </div>

                <div>
                    <Label className="block text-base font-medium mb-1">Mật khẩu</Label>
                    <Input
                        className="w-full h-11 text-base"
                        type="password"
                        {...register("password", {
                            required: true,
                        })}
                    />
                </div>

                <div>
                    <Label className="block text-base font-medium mb-1">Họ và tên</Label>
                    <Input
                        className="w-full h-11 text-base"
                        {...register("fullName", {
                            required: true,
                        })}
                    />
                </div>

                <div>
                    <Label className="block text-base font-medium mb-1">Email</Label>
                    <Input
                        className="w-full h-11 text-base"
                        type="email"
                        {...register("email")}
                    />
                </div>

                <div>
                    <Label className="block text-base font-medium mb-1">Số điện thoại</Label>
                    <Input
                        className="w-full h-11 text-base"
                        {...register("phone")}
                    />
                </div>

                <div>
                    <Label className="block text-base font-medium mb-1">Vai trò</Label>

                    <Select
                        value={String(watch("roleId"))}
                        onValueChange={(value) => setValue("roleId", Number(value))}
                    >
                        <SelectTrigger className="w-full h-11 text-base">
                            <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>

                        <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                    {role.code} - {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
            </div>
        </form>
    );
}