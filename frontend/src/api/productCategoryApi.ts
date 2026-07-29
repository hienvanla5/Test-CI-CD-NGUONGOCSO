import type { ProductCategory } from "@/types/farm";
import apiClient from "./axiosConfig";

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const response = await apiClient.get<{ data: ProductCategory[] }>('/product-categories');
  return response.data.data;
};