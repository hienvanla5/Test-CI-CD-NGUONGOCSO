import apiClient from './axiosConfig';
import type { PublicTraceResponse } from '@/types/publicTrace';

export const getPublicTrace = async (codeValue: string): Promise<PublicTraceResponse> => {
  const response = await apiClient.get<{ data: PublicTraceResponse }>(
    `/public/trace/${codeValue}`
  );
  return response.data.data;
};