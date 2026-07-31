import apiClient from "@/api/axiosConfig";
import type {
  CreateProductFeedbackPayload,
  ProductFeedback,
} from "@/types/productFeedback";

export const createProductFeedback = async (
  productionLotId: string,
  payload: CreateProductFeedbackPayload,
): Promise<ProductFeedback> => {
  const response = await apiClient.post<{ data: ProductFeedback }>(
    `/public/production-lots/${productionLotId}/feedbacks`,
    payload,
  );

  return response.data.data;
};