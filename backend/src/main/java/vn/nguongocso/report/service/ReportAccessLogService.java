package vn.nguongocso.report.service;

import java.util.UUID;

public interface ReportAccessLogService {
        /**
         * Ghi nhận lịch sử truy cập báo cáo (giao dịch độc lập).
         */
        void logAccess(UUID userId, UUID userOrgId, UUID targetOrgId, String reportName, boolean success, String ipAddress);
    }
