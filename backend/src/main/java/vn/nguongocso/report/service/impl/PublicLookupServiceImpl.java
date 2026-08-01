package vn.nguongocso.report.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.ResourceNotFoundException;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.FarmLogAttachment;
import vn.nguongocso.farm.repository.FarmLogAttachmentRepository;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.alert.service.ScanAnomalyDetectionService;
import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.repository.ChainEventRepository;
import vn.nguongocso.report.dto.response.LookupResponse;
import vn.nguongocso.report.entity.TraceCodeScanLog;
import vn.nguongocso.report.repository.TraceCodeScanLogRepository;
import vn.nguongocso.report.service.PublicLookupService;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.TraceCodeStatus;
import vn.nguongocso.trace.repository.TraceCodeRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicLookupServiceImpl implements PublicLookupService {

        private final TraceCodeRepository traceCodeRepository;
        private final TraceCodeScanLogRepository traceCodeScanLogRepository;
        private final FarmLogRepository farmLogRepository;
        private final FarmLogAttachmentRepository farmLogAttachmentRepository;
        private final ChainEventRepository chainEventRepository;
        private final ScanAnomalyDetectionService scanAnomalyDetectionService;

        @Override
        @Transactional
        public LookupResponse lookupCode(String codeValue, Double latitude, Double longitude, String location,
                        String ipAddress, String userAgent) {
                // 1. Tìm mã truy xuất
                TraceCode traceCode = traceCodeRepository.findByCodeValue(codeValue)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy mã truy xuất: " + codeValue));
                
                // 2. Kiểm tra trạng thái
                if (traceCode.getStatus() == TraceCodeStatus.INACTIVE) {
                        throw new BusinessException("Mã truy xuất chưa được kích hoạt.");
                }

                if (traceCode.getStatus() == TraceCodeStatus.RECALLED) {
                        throw new BusinessException("Mã truy xuất đã bị thu hồi.");
                }

                // 3. Ghi nhận lượt quét
                TraceCodeScanLog scanLog = TraceCodeScanLog.builder()
                                .traceCode(traceCode)
                                .scannedAt(LocalDateTime.now())
                                .ipAddress(ipAddress)
                                .userAgent(userAgent)
                                .latitude(latitude != null ? BigDecimal.valueOf(latitude) : null)
                                .longitude(longitude != null ? BigDecimal.valueOf(longitude) : null)
                                .location(location != null && !location.trim().isEmpty() ? location : "Không xác định")
                                .isAbnormal(false)
                                .build();
                // 4. Lưu log
                traceCodeScanLogRepository.save(scanLog);

                // 5. Phân tích bất thường
                scanAnomalyDetectionService.onScanRecorded(traceCode.getId());


                // 6. Build DTO trả về thông tin chi tiết
                Shipment shipment = traceCode.getShipment();
                var productionLot = shipment.getProductionLot();
                var organization = shipment.getOrganization();

                // Lấy nhật ký canh tác
                List<FarmLog> farmLogs = farmLogRepository
                                .findByProductionLotId_IdOrderByExecutedDateAsc(productionLot.getId());
                List<LookupResponse.FarmLogInfo> farmLogInfos = farmLogs.stream().map(fl -> {
                        List<FarmLogAttachment> attachments = farmLogAttachmentRepository.findByFarmLogId(fl.getId());
                        List<LookupResponse.AttachmentInfo> attachmentInfos = attachments.stream()
                                        .map(att -> new LookupResponse.AttachmentInfo(att.getId(), att.getFileName()))
                                        .collect(Collectors.toList());

                        return LookupResponse.FarmLogInfo.builder()
                                        .id(fl.getId())
                                        .logDate(fl.getExecutedDate().toString())
                                        .activityType(fl.getActivityType().name())
                                        .description(fl.getNotes())
                                        .attachments(attachmentInfos)
                                        .build();
                }).collect(Collectors.toList());

                // Lấy lịch sử sự kiện chuỗi cung ứng
                List<ChainEvent> chainEvents = chainEventRepository
                                .findByShipment_IdOrderByRecordedAtAsc(shipment.getId());
                List<LookupResponse.ChainEventInfo> chainEventInfos = chainEvents.stream()
                                .map(ce -> LookupResponse.ChainEventInfo.builder()
                                                .id(ce.getId())
                                                .eventType(ce.getEventType().name())
                                                .eventDate(ce.getRecordedAt())
                                                .eventData(ce.getEventData()) // Sử dụng ce.getEventData()
                                                .build())
                                .collect(Collectors.toList());

                return LookupResponse.builder()
                                .codeValue(traceCode.getCodeValue())
                                .status(traceCode.getStatus())
                                .activatedAt(traceCode.getActivatedAt())
                                .shipment(LookupResponse.ShipmentInfo.builder()
                                                .id(shipment.getId())
                                                .name(shipment.getName())
                                                .packagingInfo(shipment.getPackagingInfo())
                                                .totalQuantity(shipment.getTotalQuantity())
                                                .build())
                                .productionLot(LookupResponse.ProductionLotInfo.builder()
                                                .id(productionLot.getId())
                                                .name(productionLot.getName())
                                                .plantingDate(productionLot.getPlantingDate() != null
                                                                ? productionLot.getPlantingDate().toString()
                                                                : null)
                                                .harvestDate(productionLot.getHarvestDate() != null
                                                                ? productionLot.getHarvestDate().toString()
                                                                : null)
                                                .cropType(productionLot.getProductCategory() != null
                                                                ? productionLot.getProductCategory().getName()
                                                                : null)
                                                .organization(LookupResponse.OrgInfo.builder()
                                                                .id(organization.getOrganizationId())
                                                                .name(organization.getName())
                                                                .build())
                                                .build())
                                .farmLogs(farmLogInfos)
                                .chainEvents(chainEventInfos)
                                .build();
        }
}
