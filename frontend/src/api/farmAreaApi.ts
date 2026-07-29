import axios from 'axios';
import { getToken } from '@/utils/storage';
import type { CreateFarmAreaRequest, CreateFarmAreaResponse, CropType } from '@/types/farmArea';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tạo vùng trồng
export const createFarmArea = async (
  data: CreateFarmAreaRequest
): Promise<CreateFarmAreaResponse> => {
  const response = await apiClient.post<CreateFarmAreaResponse>('farm-areas', data);
  return response.data;
};

// Lấy danh sách loại cây trồng
export const getCropTypes = async (): Promise<CropType[]> => {
  const response = await apiClient.get('/product-categories');

  console.log("========== RESPONSE ==========");
  console.log(response.data);
  console.log("==============================");

  return response.data.data.map((item: any) => ({
    id: item.id,
    name: item.name,
  }));
};

// Mock data (dùng khi API chưa có hoặc lỗi)
function getMockCropTypes(): CropType[] {
  return [
    { id: 'cd16698a-8384-11f1-a80c-e89c251cc2ec', name: 'Chè' },
    { id: 'cd16698b-8384-11f1-a80c-e89c251cc2ec', name: 'Cà phê' },
    { id: 'cd16698c-8384-11f1-a80c-e89c251cc2ec', name: 'Lúa' },
    { id: 'cd16698d-8384-11f1-a80c-e89c251cc2ec', name: 'Ngô' },
    { id: 'cd16698e-8384-11f1-a80c-e89c251cc2ec', name: 'Sắn' },
  ];
}