import { getFarmAreas } from "@/api/farmApi";
import { getProductCategories } from "@/api/productCategoryApi";
import { getProductionLotById, updateProductionLot } from "@/api/productionLotApi";
import { useAuth } from "@/hooks/useAuth";
import { type ProductCategory, type ProductionLot, type FarmArea } from "@/types/farm";
import { updateProductionLotSchema, type UpdateProductionLotFormValues } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

export const ProductionLotEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lot, setLot] = useState<ProductionLot | null>(null);
  const [farmAreas, setFarmAreas] = useState<FarmArea[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProductionLotFormValues>({
    resolver: zodResolver(updateProductionLotSchema),
  });

  const selectedCategory = watch('productCategoryId');
  const selectedFarmArea = watch('farmAreaId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotData, areas, cats] = await Promise.all([
          getProductionLotById(id!),
          getFarmAreas(),
          getProductCategories(),
        ]);
        setLot(lotData);
        setFarmAreas(areas);
        setCategories(cats);

        reset({
          name: lotData.name,
          farmAreaId: lotData.farmAreaId ?? null,
          productCategoryId: lotData.productCategoryId,
          expectedQuantity: lotData.expectedQuantity,
          plantingDate: lotData.plantingDate.split('T')[0],
        });
      } catch (error) {
        toast.error('Không thể tải thông tin lô sản xuất');
        navigate('/production-lots');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, reset, navigate]);

  const canEdit = user?.roleCode === 'VT-01' || user?.roleCode === 'VT-02';
  const isDraft = lot?.status === 'DRAFT';
  const editable = canEdit && isDraft;

  const onSubmit = async (data: UpdateProductionLotFormValues) => {
    if (!editable) {
      toast.error('Lô không ở trạng thái nháp hoặc bạn không có quyền');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateProductionLot(id!, {
        name: data.name,
        farmAreaId: data.farmAreaId || null,
        productCategoryId: data.productCategoryId,
        expectedQuantity: data.expectedQuantity,
        plantingDate: data.plantingDate,
      });
      toast.success('Cập nhật lô sản xuất thành công');
      navigate(`/production-lots/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải....</div>
  }

  if (!lot) {
    return <div className="text-center p-8">Không tìm thấy lô sản xuất</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chỉnh sửa lô sản xuất</CardTitle>
        <CardDescription>
          {lot.name} – Trạng thái: <span className="font-semibold">{lot.status}</span>
          {!editable && (
            <span className="text-red-500 ml-2">(Chỉ sửa được khi lô ở trạng thái DRAFT)</span>
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Tên lô */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên lô *</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={!editable}
              placeholder="Nhập tên lô"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Loại nông sản */}
          <div className="space-y-2">
            <Label htmlFor="productCategoryId">Loại nông sản *</Label>
            <Select
              value={selectedCategory || ''}
              onValueChange={(val) => setValue('productCategoryId', val ?? "", { shouldValidate: true })}
              disabled={!editable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại nông sản" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(cat => cat.isActive).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productCategoryId && <p className="text-sm text-red-500">{errors.productCategoryId.message}</p>}
          </div>

          {/* Vùng trồng */}
          <div className="space-y-2">
            <Label htmlFor="farmAreaId">Vùng trồng (không bắt buộc)</Label>
            <Select
              value={selectedFarmArea || ''}
              onValueChange={(val) => setValue('farmAreaId', val || null, { shouldValidate: true })}
              disabled={!editable}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vùng trồng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không chọn</SelectItem>
                {farmAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sản lượng dự kiến */}
          <div className="space-y-2">
            <Label htmlFor="expectedQuantity">Sản lượng dự kiến *</Label>
            <Input
              id="expectedQuantity"
              type="number"
              step="0.01"
              {...register('expectedQuantity')}
              disabled={!editable}
              placeholder="Nhập sản lượng dự kiến"
            />
            {errors.expectedQuantity && <p className="text-sm text-red-500">{errors.expectedQuantity.message}</p>}
          </div>

          {/* Ngày xuống giống */}
          <div className="space-y-2">
            <Label htmlFor="plantingDate">Ngày xuống giống *</Label>
            <Input
              id="plantingDate"
              type="date"
              {...register('plantingDate')}
              disabled={!editable}
            />
            {errors.plantingDate && <p className="text-sm text-red-500">{errors.plantingDate.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(`/production-lots/${id}`)}>
            Hủy
          </Button>
          {editable && (
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};