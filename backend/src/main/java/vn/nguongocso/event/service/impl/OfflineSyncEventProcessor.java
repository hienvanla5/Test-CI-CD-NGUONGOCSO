package vn.nguongocso.event.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.request.RecordOfflineEventDto;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.response.OfflineEventSyncResultDto;
import vn.nguongocso.event.entity.OfflineSyncLog;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.OfflineSyncLogRepository;
import vn.nguongocso.event.service.ChainEventService;
import vn.nguongocso.exception.BusinessException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Xử lý một sự kiện ngoại tuyến trong transaction riêng.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OfflineSyncEventProcessor {

    private final OfflineSyncLogRepository offlineSyncLogRepository;
    private final UserRepository userRepository;
    // Inject các service cần thiết để ghi sự kiện thực tế
    // (ví dụ: ChainEventService để gọi recordHarvestEvent, recordPackagingEvent...)
    private final ChainEventService chainEventService; // hoặc interface

    /**
     * Xử lý một event trong transaction riêng (REQUIRES_NEW).
     * Khi phương thức này được gọi, transaction hiện tại (nếu có) sẽ tạm dừng,
     * và một transaction mới được tạo.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public OfflineEventSyncResultDto processEvent(RecordOfflineEventDto eventDto, UUID syncId, CustomUserDetails currentUser) {
        try {
            // Xác định loại sự kiện và gọi service tương ứng
            if (eventDto.getEventType() == ChainEventType.HARVEST) {
                // Tạo request cho thu hoạch
                RecordHarvestEventRequest harvestRequest = new RecordHarvestEventRequest();
                harvestRequest.setProductionLotId(eventDto.getProductionLotId());

                // Lấy quantity (có thể là Integer hoặc Double)
                Object quantityObj = eventDto.getEventData().get("quantity");
                if (quantityObj == null) {
                    throw new BusinessException("Thiếu thông tin sản lượng");
                }
                harvestRequest.setQuantity(((Number) quantityObj).doubleValue());

                // Lấy harvestDate
                Object harvestDateObj = eventDto.getEventData().get("harvestDate");
                if (harvestDateObj == null) {
                    throw new BusinessException("Thiếu thông tin ngày thu hoạch");
                }
                harvestRequest.setHarvestDate(LocalDate.parse(harvestDateObj.toString()));

                harvestRequest.setLatitude(eventDto.getLatitude());
                harvestRequest.setLongitude(eventDto.getLongitude());

                // Gọi service ghi sự kiện thu hoạch
                chainEventService.recordHarvestEvent(harvestRequest, currentUser);

            } else if (eventDto.getEventType() == ChainEventType.PACKAGING) {
                // Tạo request cho đóng gói
                RecordPackagingEventRequest packagingRequest = new RecordPackagingEventRequest();
                packagingRequest.setProductionLotId(eventDto.getProductionLotId());

                Object specObj = eventDto.getEventData().get("packagingSpecification");
                if (specObj == null) {
                    throw new BusinessException("Thiếu thông tin quy cách đóng gói");
                }
                packagingRequest.setPackagingSpecification(specObj.toString());

                Object packagingDateObj = eventDto.getEventData().get("packagingDate");
                if (packagingDateObj == null) {
                    throw new BusinessException("Thiếu thông tin ngày đóng gói");
                }
                packagingRequest.setPackagingDate(LocalDate.parse(packagingDateObj.toString()));

                packagingRequest.setLatitude(eventDto.getLatitude());
                packagingRequest.setLongitude(eventDto.getLongitude());

                // Gọi service ghi sự kiện đóng gói
                chainEventService.recordPackagingEvent(packagingRequest, currentUser);

            } else {
                // Các loại sự kiện khác (TRANSPORT, PROCUREMENT) chưa hỗ trợ
                throw new BusinessException("Loại sự kiện không hỗ trợ đồng bộ ngoại tuyến: " + eventDto.getEventType());
            }

            // Nếu thành công
            return OfflineEventSyncResultDto.builder()
                    .offlineEventId(eventDto.getOfflineEventId())
                    .status("SUCCESS")
                    .build();

        } catch (BusinessException e) {
            // Lỗi nghiệp vụ -> ghi log và trả về FAILED
            saveFailedSyncLog(eventDto, syncId, e.getMessage(), currentUser);
            return OfflineEventSyncResultDto.builder()
                    .offlineEventId(eventDto.getOfflineEventId())
                    .status("FAILED")
                    .message(e.getMessage())
                    .build();

        } catch (Exception e) {
            // Lỗi hệ thống
            log.error("Lỗi xử lý event ngoại tuyến {}: {}", eventDto.getOfflineEventId(), e.getMessage(), e);
            saveFailedSyncLog(eventDto, syncId, "Lỗi hệ thống: " + e.getMessage(), currentUser);
            return OfflineEventSyncResultDto.builder()
                    .offlineEventId(eventDto.getOfflineEventId())
                    .status("FAILED")
                    .message("Lỗi hệ thống: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Lưu log thất bại với pessimistic locking.
     * Phương thức này yêu cầu đã có transaction (Propagation.MANDATORY).
     * Nó sẽ được gọi bên trong processEvent, nơi đã có transaction.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void saveFailedSyncLog(RecordOfflineEventDto eventDto, UUID syncId, String reason, CustomUserDetails currentUser) {
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

            // Tìm và khóa bản ghi hiện có
            Optional<OfflineSyncLog> existing = offlineSyncLogRepository
                    .findByOfflineEventIdWithLock(eventDto.getOfflineEventId());

            if (existing.isPresent()) {
                // ✅ Đổi tên biến từ log -> syncLog
                OfflineSyncLog syncLog = existing.get();
                syncLog.setSyncId(syncId);
                syncLog.setFailureReason(reason);
                syncLog.setSyncedAt(LocalDateTime.now());
                offlineSyncLogRepository.save(syncLog);
                // ✅ Dùng Logger (log) để ghi log
                log.info("Updated existing offline sync log for event {}", eventDto.getOfflineEventId());
            } else {
                // Nếu chưa có, insert mới
                OfflineSyncLog newLog = OfflineSyncLog.builder()
                        .syncId(syncId)
                        .user(actor)
                        .offlineEventId(eventDto.getOfflineEventId())
                        .productionLotId(lotId)
                        .shipmentId(shipmentId)
                        .eventType(eventDto.getEventType())
                        .status("FAILED")
                        .failureReason(reason)
                        .build();
                offlineSyncLogRepository.save(newLog);
                log.info("Inserted new offline sync log for event {}", eventDto.getOfflineEventId());
            }
        } catch (Exception ex) {
            log.error("Không thể lưu log thất bại cho offlineEventId: {}", eventDto.getOfflineEventId(), ex);
        }
    }
}