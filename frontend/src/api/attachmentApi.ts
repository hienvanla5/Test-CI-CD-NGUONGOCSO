import type { Attachment } from '@/types/attachment';
import apiClient from './axiosConfig';

export const getAttachments = async (logId: string): Promise<Attachment[]> => {
  const response = await apiClient.get<{ success: boolean; data: Attachment[] }>(
    `/farm-logs/${logId}/attachments`
  );
  return response.data.data;
};

export const uploadAttachment = async (
  logId: string,
  file: File,
  description?: string
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);

  const response = await apiClient.post<{ success: boolean; data: Attachment }>(
    `/farm-logs/${logId}/attachments`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
};

export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await apiClient.delete(`/farm-logs/attachments/${attachmentId}`);
};