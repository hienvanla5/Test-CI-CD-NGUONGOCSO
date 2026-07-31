import apiClient from './axiosConfig';

/**
 * TC-04 (NCL-07-CN-001): ghi lịch sử mỗi lần một bảng điều khiển/báo cáo được mở.
 *
 * ⚠️ Endpoint `/reports/access-logs` là GIẢ ĐỊNH — không có trong danh sách API
 * hiện tại của dự án (`src/api/*`). Cần xác nhận với backend đường dẫn và
 * payload thật trước khi coi TC-04 là hoàn tất.
 *
 * Ghi log là best-effort: lỗi ghi log không được chặn hoặc làm gián đoạn
 * trải nghiệm xem bảng điều khiển của người dùng, nên không dùng toast.error
 * và không throw ra ngoài.
 */
export const logDashboardAccess = async (dashboardKey: string): Promise<void> => {
  try {
    await apiClient.post('/reports/access-logs', { dashboardKey });
  } catch {
    // best-effort — im lặng bỏ qua lỗi ghi log
  }
};