package vn.nguongocso.alert_reclaim_history.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.alert_reclaim_history.dto.response.ActivityLogResponse;
import vn.nguongocso.alert_reclaim_history.entity.ActivityLog;
import vn.nguongocso.alert_reclaim_history.repository.ActivityLogRepository;
import vn.nguongocso.alert_reclaim_history.specification.ActivityLogSpecification;
import vn.nguongocso.alert_reclaim_history.service.ActivityLogService;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ActivityLogResponse> getActivityLogs(
            int page, int size, String action, String actorName,
            LocalDate startDate, LocalDate endDate, CustomUserDetails currentUser) {

        // Sắp xếp mặc định theo thời gian giảm dần (mới nhất trước)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Specification<ActivityLog> spec = ActivityLogSpecification.hasOrganizationId(currentUser.getOrganizationId());

        if (action != null && !action.isBlank()) {
            spec = spec.and(ActivityLogSpecification.hasAction(action));
        }
        if (actorName != null && !actorName.isBlank()) {
            spec = spec.and(ActivityLogSpecification.hasActorName(actorName));
        }
        if (startDate != null || endDate != null) {
            spec = spec.and(ActivityLogSpecification.createdBetween(startDate, endDate));
        }


        Page<ActivityLog> logPage = activityLogRepository.findAll(spec, pageable);

        List<ActivityLogResponse> items = logPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.from(logPage, items);
    }

    private ActivityLogResponse convertToResponse(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .fullName(log.getFullName())
                .action(log.getAction())
                .description(log.getDescription())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
