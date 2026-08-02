package vn.nguongocso.event.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.event.dto.request.RecordMobileEventRequest;
import vn.nguongocso.event.dto.request.RecordOfflineEventDto;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.dto.response.OfflineEventSyncResultDto;
import vn.nguongocso.event.entity.OfflineSyncLog;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.OfflineSyncLogRepository;
import vn.nguongocso.event.service.ChainEventService;
import vn.nguongocso.event.service.EventValidationService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.repository.ShipmentRepository;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OfflineSyncEventProcessor {

    private final OfflineSyncLogRepository offlineSyncLogRepository;
    private final ChainEventService chainEventService;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final EventValidationService eventValidationService;

    /**
     * Xử lý độc lập một sự kiện trong Transaction mới.
     * Nếu có lỗi xảy ra, chỉ Transaction của sự kiện này bị rollback.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public OfflineEventSyncResultDto processEvent(
            RecordOfflineEventDto eventDto,
            UUID syncId,
            CustomUserDetails currentUser) {

        // 1. Kiểm tra trùng lặp (Deduplication Check)
        Optional<OfflineSyncLog> existingLog = offlineSyncLogRepository.findByOfflineEventId(eventDto.getOfflineEventId());
        if (existingLog.isPresent()) {
            OfflineSyncLog log = existingLog.get();
            // Nếu đã từng xử lý thành công hoặc bỏ qua bản trùng
            if ("SUCCESS".equals(log.getStatus()) || "DUPLICATE".equals(log.getStatus())) {
                return OfflineEventSyncResultDto.builder()
                        .offlineEventId(eventDto.getOfflineEventId())
                        .status("DUPLICATE")
                        .message("Sự kiện đã được đồng bộ trước đó. Bỏ qua bản trùng.")
                        .build();
            }
        }

        // 2. Xác thực nghiệp vụ đặc thù: Lô bị thu hồi (Recall Protection - NCL-10-CN-005-TC-03)
        // Trường hợp là sự kiện Vận chuyển (TRANSPORT) hoặc Thu mua (PROCUREMENT) liên quan tới Lô hàng (Shipment)
        if (eventDto.getEventType() == ChainEventType.TRANSPORT || eventDto.getEventType() == ChainEventType.PROCUREMENT) {
            Shipment shipment = shipmentRepository.findById(eventDto.getProductionLotId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng liên quan."));
            if (shipment.getStatus() == ShipmentStatus.RECALLED) {
                // Ghi nhận log lỗi nghiệp vụ chung của hệ thống
                eventValidationService.logFailedAttempt(shipment.getId(), shipment.getName(), eventDto.getEventType(), "Lô hàng đã bị thu hồi, không thể ghi sự kiện.", currentUser);
                throw new BusinessException("Lô hàng đã bị thu hồi, không thể ghi nhận sự kiện.");
            }
        }

        // 3. Map DTO ngoại tuyến sang Request ghi nhận sự kiện di động thông thường
        RecordMobileEventRequest request = new RecordMobileEventRequest();
        request.setProductionLotId(eventDto.getProductionLotId());
        request.setEventType(eventDto.getEventType());
        request.setRecordedAt(eventDto.getRecordedAt());
        request.setLatitude(eventDto.getLatitude());
        request.setLongitude(eventDto.getLongitude());
        request.setImages(eventDto.getImages());
        request.setDeviceSource(eventDto.getDeviceSource());
        request.setEventData(eventDto.getEventData());

        // 4. Gọi Service ghi nhận sự kiện của hệ thống (Re-use core logic)
        ChainEventResponse chainEventResponse = chainEventService.recordMobileEvent(request, currentUser);

        // 5. Ghi nhận log SUCCESS vào DB
        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người vận hành."));

        UUID lotId = null;
        UUID shipmentId = null;
        if (eventDto.getEventType() == ChainEventType.TRANSPORT || eventDto.getEventType() == ChainEventType.PROCUREMENT) {
            shipmentId = eventDto.getProductionLotId();
        } else {
            lotId = eventDto.getProductionLotId();
        }

        OfflineSyncLog syncLog = OfflineSyncLog.builder()
                .syncId(syncId)
                .user(actor)
                .offlineEventId(eventDto.getOfflineEventId())
                .productionLotId(lotId)
                .shipmentId(shipmentId)
                .eventType(eventDto.getEventType())
                .status("SUCCESS")
                .build();

        offlineSyncLogRepository.save(syncLog);

        return OfflineEventSyncResultDto.builder()
                .offlineEventId(eventDto.getOfflineEventId())
                .status("SUCCESS")
                .eventId(chainEventResponse.getId())
                .message("Đồng bộ sự kiện thành công.")
                .build();
    }
}
