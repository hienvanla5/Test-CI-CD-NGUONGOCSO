package vn.nguongocso.event.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.event.dto.request.OfflineEventSyncRequest;
import vn.nguongocso.event.dto.request.RecordOfflineEventDto;
import vn.nguongocso.event.dto.response.OfflineEventSyncResponse;
import vn.nguongocso.event.dto.response.OfflineEventSyncResultDto;
import vn.nguongocso.event.entity.OfflineSyncLog;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.OfflineSyncLogRepository;
import vn.nguongocso.event.service.OfflineSyncService;
import vn.nguongocso.exception.BusinessException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfflineSyncServiceImpl implements OfflineSyncService {

    private static final Logger log = LoggerFactory.getLogger(OfflineSyncServiceImpl.class);

    private final OfflineSyncEventProcessor offlineSyncEventProcessor;
    private final OfflineSyncLogRepository offlineSyncLogRepository;
    private final UserRepository userRepository;

    @Override
    public OfflineEventSyncResponse syncOfflineEvents(OfflineEventSyncRequest request, CustomUserDetails currentUser) {
        log.info("Bắt đầu xử lý đồng bộ ngoại tuyến cho phiên syncId: {}", request.getSyncId());

        List<OfflineEventSyncResultDto> results = new ArrayList<>();
        int successCount = 0;
        int duplicateCount = 0;
        int failedCount = 0;

        // Lặp qua danh sách sự kiện gửi lên
        for (RecordOfflineEventDto eventDto : request.getEvents()) {
            try {
                // Gọi xử lý sự kiện biệt lập qua Transaction REQUIRES_NEW
                OfflineEventSyncResultDto result = offlineSyncEventProcessor.processEvent(eventDto, request.getSyncId(), currentUser);
                results.add(result);

                if ("SUCCESS".equals(result.getStatus())) {
                    successCount++;
                } else if ("DUPLICATE".equals(result.getStatus())) {
                    duplicateCount++;
                }
            } catch (Exception e) {
                // Xử lý khi có lỗi xảy ra ở sự kiện hiện tại
                log.error("Lỗi đồng bộ sự kiện ngoại tuyến {}: {}", eventDto.getOfflineEventId(), e.getMessage());
                failedCount++;

                // Lưu lại vết FAILED của sự kiện lỗi này vào bảng log
                saveFailedSyncLog(eventDto, request.getSyncId(), e.getMessage(), currentUser);

                results.add(OfflineEventSyncResultDto.builder()
                        .offlineEventId(eventDto.getOfflineEventId())
                        .status("FAILED")
                        .message(e.getMessage() != null ? e.getMessage() : "Đã xảy ra lỗi không xác định.")
                        .build());
            }
        }

        return OfflineEventSyncResponse.builder()
                .syncId(request.getSyncId())
                .totalEvents(request.getEvents().size())
                .successCount(successCount)
                .duplicateCount(duplicateCount)
                .failedCount(failedCount)
                .results(results)
                .build();
    }

    /**
     * Ghi log trạng thái FAILED trong một transaction mới để tránh bị ảnh hưởng bởi rollback của sự kiện.
     */
    private void saveFailedSyncLog(RecordOfflineEventDto eventDto, UUID syncId, String reason, CustomUserDetails currentUser) {
        try {
            User actor = userRepository.findById(currentUser.getUserId()).orElse(null);
            if (actor == null) return;

            UUID lotId = null;
            UUID shipmentId = null;
            if (eventDto.getEventType() == ChainEventType.TRANSPORT || eventDto.getEventType() == ChainEventType.PROCUREMENT) {
                shipmentId = eventDto.getProductionLotId();
            } else {
                lotId = eventDto.getProductionLotId();
            }

            OfflineSyncLog failedLog = OfflineSyncLog.builder()
                    .syncId(syncId)
                    .user(actor)
                    .offlineEventId(eventDto.getOfflineEventId())
                    .productionLotId(lotId)
                    .shipmentId(shipmentId)
                    .eventType(eventDto.getEventType())
                    .status("FAILED")
                    .failureReason(reason)
                    .build();

            offlineSyncLogRepository.save(failedLog);
        } catch (Exception ex) {
            log.error("Không thể lưu log thất bại vào database cho offlineEventId: {}", eventDto.getOfflineEventId(), ex);
        }
    }
}
