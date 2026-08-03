package vn.nguongocso.alert.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.alert.dto.request.ActivityLogRequest;
import vn.nguongocso.alert.dto.response.ActivityLogResponse;

import java.time.LocalDate;

public interface ActivityLogService {

    PageResponse<ActivityLogResponse> getActivityLogs(
            int page,
            int size,
            String action,
            String actorName,
            LocalDate startDate,
            LocalDate endDate,
            CustomUserDetails currentUser
    );

    /**
     * Ghi nhật ký hoạt động.
     */
    void logActivity(ActivityLogRequest request);

}
