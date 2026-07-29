package vn.nguongocso.event.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.PageResponse;
import vn.nguongocso.event.dto.response.FailedEventLogResponse;
import vn.nguongocso.event.dto.response.LotValidationResponse;
import vn.nguongocso.event.entity.FailedEventLog;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.FailedEventLogRepository;
import vn.nguongocso.event.service.EventValidationService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.trace.entity.CodeRange;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.repository.CodeRangeRepository;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventValidationServiceImpl implements EventValidationService {

    private final ProductionLotRepository productionLotRepository;
    private final ShipmentRepository shipmentRepository;
    private final FailedEventLogRepository failedEventLogRepository;
    private final UserRepository userRepository;
    private final TraceCodeRepository traceCodeRepository;
    private final CodeRangeRepository codeRangeRepository;

    @Override
    @Transactional(readOnly = true)
    public LotValidationResponse validateLot(UUID lotId, ChainEventType eventType, CustomUserDetails currentUser) {
        if (eventType == ChainEventType.HARVEST || eventType == ChainEventType.PACKAGING) {
            ProductionLot lot = productionLotRepository.findById(lotId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

            boolean valid = false;
            String message = "";

            if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                message = "Bạn không thuộc tổ chức quản lý của lô sản xuất này.";
            } else if (eventType == ChainEventType.HARVEST && lot.getStatus() != ProductionLotStatus.APPROVED) {
                message = "Lô sản xuất chưa được duyệt, không thể ghi sự kiện thu hoạch.";
            } else if (eventType == ChainEventType.PACKAGING && lot.getStatus() != ProductionLotStatus.HARVESTED) {
                message = "Chỉ được ghi nhận sự kiện đóng gói cho lô đã thu hoạch.";
            } else {
                valid = true;
                message = "Lô sản xuất hợp lệ.";
            }

            return LotValidationResponse.builder()
                    .lotId(lotId)
                    .eventType(eventType.name())
                    .valid(valid)
                    .message(message)
                    .details(LotValidationResponse.LotDetails.builder()
                            .lotType("PRODUCTION_LOT")
                            .currentStatus(lot.getStatus().name())
                            .organizationId(lot.getOrganization().getOrganizationId())
                            .build())
                    .build();

        } else if (eventType == ChainEventType.TRANSPORT || eventType == ChainEventType.PROCUREMENT) {
            Shipment shipment = shipmentRepository.findById(lotId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng."));

            boolean valid = false;
            String message = "";

            if (eventType == ChainEventType.TRANSPORT && !shipment.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                message = "Bạn không thuộc tổ chức quản lý của lô hàng này.";
            } else if (shipment.getStatus() == ShipmentStatus.RECALLED) {
                message = "Lô hàng đã bị thu hồi, không thể ghi sự kiện.";
            } else if (shipment.getStatus() != ShipmentStatus.ACTIVATED) {
                message = "Lô hàng chưa được kích hoạt, không thể ghi sự kiện.";
            } else {
                valid = true;
                message = "Lô hàng hợp lệ.";
            }

            return LotValidationResponse.builder()
                    .lotId(lotId)
                    .eventType(eventType.name())
                    .valid(valid)
                    .message(message)
                    .details(LotValidationResponse.LotDetails.builder()
                            .lotType("SHIPMENT")
                            .currentStatus(shipment.getStatus().name())
                            .organizationId(shipment.getOrganization().getOrganizationId())
                            .build())
                    .build();
        }

        throw new BusinessException("Loại sự kiện không được hỗ trợ để xác thực lô.");
    }

    @Override
    @Transactional
    public void deleteDraft(UUID draftId, CustomUserDetails currentUser) {
        Shipment shipment = shipmentRepository.findById(draftId).orElse(null);
        if (shipment != null) {
            if (!shipment.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô hàng này.");
            }

            if (shipment.getStatus() != ShipmentStatus.DRAFT && shipment.getStatus() != ShipmentStatus.CODE_PRINTED) {
                throw new BusinessException("Không thể hủy bản nháp vì lô hàng đã được kích hoạt hoặc thu hồi.");
            }

            // Hoàn lại dải mã truy xuất của tổ chức
            CodeRange codeRange = codeRangeRepository.findByOrganizationOrganizationId(currentUser.getOrganizationId())
                    .orElse(null);
            if (codeRange != null) {
                codeRange.setUsedCount(Math.max(0, codeRange.getUsedCount() - shipment.getTotalQuantity()));
                codeRangeRepository.save(codeRange);
            }

            // Xóa trace codes
            traceCodeRepository.deleteByShipmentId(shipment.getId());

            // Xóa shipment
            shipmentRepository.delete(shipment);
            return;
        }

        throw new BusinessException("Không tìm thấy bản nháp hợp lệ để thực hiện hủy.");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FailedEventLogResponse> getFailedLogs(Pageable pageable) {
        Page<FailedEventLog> logs = failedEventLogRepository.findAllByOrderByAttemptedAtDesc(pageable);
        List<FailedEventLogResponse> items = logs.getContent().stream()
                .map(log -> FailedEventLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUser().getUserId())
                        .userFullName(log.getUser().getFullName())
                        .eventType(log.getEventType().name())
                        .lotId(log.getLotId())
                        .lotCode(log.getLotCode())
                        .failureReason(log.getFailureReason())
                        .attemptedAt(log.getAttemptedAt())
                        .build())
                .toList();

        return PageResponse.from(logs, items);
    }

    @Override
    @Transactional
    public void logFailedAttempt(UUID lotId, String lotCode, ChainEventType eventType, String reason, CustomUserDetails currentUser) {
        User user = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người dùng."));

        FailedEventLog log = FailedEventLog.builder()
                .user(user)
                .eventType(eventType)
                .lotId(lotId)
                .lotCode(lotCode)
                .failureReason(reason)
                .attemptedAt(LocalDateTime.now())
                .build();

        failedEventLogRepository.save(log);
    }
}
