package vn.nguongocso.publicapi.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.alert.service.ScanAnomalyDetectionService;
import vn.nguongocso.certification.entity.Certification;
import vn.nguongocso.certification.entity.ProductionLotCertification;
import vn.nguongocso.certification.enums.CertificationStatus;
import vn.nguongocso.certification.repository.ProductionLotCertificationRepository;
import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.ChainEventRepository;
import vn.nguongocso.publicapi.dto.response.PublicCertificationResponse;
import vn.nguongocso.publicapi.dto.response.PublicChainEventItem;
import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;
import vn.nguongocso.publicapi.service.PublicTraceService;
import vn.nguongocso.report.entity.TraceCodeScanLog;
import vn.nguongocso.report.repository.TraceCodeScanLogRepository;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.enums.TraceCodeStatus;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicTraceServiceImpl implements PublicTraceService {

    private final TraceCodeRepository traceCodeRepository;
    private final ShipmentRepository shipmentRepository;
    private final ChainEventRepository chainEventRepository;
    private final ObjectMapper objectMapper;
    private final TraceCodeScanLogRepository traceCodeScanLogRepository;
    private final ScanAnomalyDetectionService scanAnomalyDetectionService;
    private final ProductionLotCertificationRepository productionLotCertificationRepository;

    @Override
    public PublicTraceResponse getPublicTrace(String codeValue, Double latitude, Double longitude, String location,
            String ipAddress, String userAgent) {
        // TC-02: Kiểm tra tồn tại mã
        TraceCode traceCode = traceCodeRepository.findByCodeValue(codeValue)
                .orElseThrow(() -> new BusinessException("Mã lô hàng không tồn tại."));

        // TC-03: Kiểm tra trạng thái tem
        if (traceCode.getStatus() != TraceCodeStatus.ACTIVE) {
            throw new BusinessException("Tem chưa có hiệu lực, chưa thể tra cứu hành trình.");
        }

        // Ghi nhận lượt quét
        TraceCodeScanLog scanLog = TraceCodeScanLog.builder()
                .traceCode(traceCode)
                .scannedAt(LocalDateTime.now())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .latitude(latitude != null ? BigDecimal.valueOf(latitude) : null)
                .longitude(longitude != null ? BigDecimal.valueOf(longitude) : null)
                .location(location != null && !location.isBlank()
                        ? location
                        : "Không xác định")
                .isAbnormal(false)
                .build();

        traceCodeScanLogRepository.save(scanLog);

        // Kiểm tra phát hiện bất thường
        scanAnomalyDetectionService.onScanRecorded(traceCode.getId());

        // Xác định Shipment
        Shipment shipment = traceCode.getShipment();
        if (shipment == null) {
            throw new BusinessException("Không tìm thấy lô hàng liên kết.");
        }

        List<PublicCertificationResponse> certifications = getPublicCertifications(traceCode.getCodeValue());

        // TC-04: Kiểm tra thu hồi
        boolean isRecalled = ShipmentStatus.RECALLED.equals(shipment.getStatus());
        String recallMessage = isRecalled
                ? "Lô hàng này đã bị thu hồi. Vui lòng ngừng sử dụng và liên hệ nhà cung cấp."
                : null;

        // Lấy dòng sự kiện từ Shipment (TRANSPORT, PROCUREMENT, ...)
        List<ChainEvent> shipmentEvents = chainEventRepository.findByShipmentIdOrderByRecordedAtAsc(shipment.getId());

        // Lấy dòng sự kiện từ ProductionLot (HARVEST, PACKAGING)
        List<ChainEvent> productionLotEvents = Collections.emptyList();
        if (shipment.getProductionLot() != null) {
            UUID productionLotId = shipment.getProductionLot().getId();
            // Lọc các event không có shipment và có eventType là HARVEST hoặc PACKAGING
            List<ChainEvent> allUnassignedEvents = chainEventRepository.findByShipmentIsNullAndEventTypeIn(
                    List.of(ChainEventType.HARVEST, ChainEventType.PACKAGING));
            // Lọc theo productionLotId trong eventData
            productionLotEvents = allUnassignedEvents.stream()
                    .filter(e -> {
                        Map<String, Object> data = parseEventData(e.getEventData());
                        Object lotId = data.get("productionLotId");
                        return lotId != null && lotId.toString().equals(productionLotId.toString());
                    })
                    .collect(Collectors.toList());
        }

        // Gộp và sắp xếp theo thời gian
        List<ChainEvent> allEvents = new ArrayList<>();
        allEvents.addAll(shipmentEvents);
        allEvents.addAll(productionLotEvents);
        allEvents.sort(Comparator.comparing(ChainEvent::getRecordedAt));

        // Chuyển đổi sang DTO công khai (filter trường nội bộ)
        List<PublicChainEventItem> publicEvents = allEvents.stream()
                .map(this::convertToPublicEvent)
                .collect(Collectors.toList());

        // Lấy tên sản phẩm từ ProductionLot
        String productName = shipment.getProductionLot() != null
                ? shipment.getProductionLot().getName()
                : "Sản phẩm";

        return PublicTraceResponse.builder()
                .codeValue(traceCode.getCodeValue())
                .productionLotId(
                        shipment.getProductionLot() != null
                                ? shipment.getProductionLot().getId()
                                : null)
                .productName(productName)
                .shipmentCode(shipment.getId().toString())
                .shipmentStatus(shipment.getStatus().name())
                .recalled(isRecalled)
                .recallMessage(recallMessage)
                .certifications(certifications)
                .events(publicEvents)
                .build();
    }

    private PublicChainEventItem convertToPublicEvent(ChainEvent event) {
        // Parse eventData JSON sang Map
        Map<String, Object> rawData = parseEventData(event.getEventData());
        // Lọc dữ liệu công khai
        Map<String, Object> filteredData = filterEventData(rawData, event.getEventType());

        // Trích xuất latitude, longitude từ location
        Double latitude = null;
        Double longitude = null;
        if (event.getLocation() != null) {
            latitude = event.getLocation().getY(); // JTS Point: getY() = latitude
            longitude = event.getLocation().getX(); // getX() = longitude
        }

        return PublicChainEventItem.builder()
                .eventType(event.getEventType().name())
                .eventData(filteredData)
                .recordedAt(event.getRecordedAt())
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }

    private Map<String, Object> parseEventData(String eventDataJson) {
        if (eventDataJson == null || eventDataJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(eventDataJson, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            log.warn("Không thể parse eventData: {}", eventDataJson, e);
            return new HashMap<>();
        }
    }

    private Map<String, Object> filterEventData(Map<String, Object> rawData, ChainEventType eventType) {
        Map<String, Object> result = new HashMap<>();

        switch (eventType) {
            case HARVEST:
                keepFields(rawData, result, "productionLotName", "quantity", "harvestDate");
                break;
            case PACKAGING:
                keepFields(rawData, result, "productionLotName", "packagingSpecification", "packagingDate");
                break;
            case TRANSPORT:
                keepFields(rawData, result, "fromLocation", "toLocation", "transportDate");
                break;
            case PROCUREMENT:
                keepFields(rawData, result, "buyerName", "purchaseDate", "quantity");
                break;
            default:
                // Chỉ giữ các trường an toàn, tránh lộ thông tin nội bộ
                result.putAll(rawData);
                result.remove("recordedBy");
                result.remove("createdAt");
                result.remove("updatedAt");
        }

        return result;
    }

    private void keepFields(Map<String, Object> source, Map<String, Object> target, String... fields) {
        for (String field : fields) {
            if (source.containsKey(field)) {
                target.put(field, source.get(field));
            }
        }
    }

    private List<PublicCertificationResponse> getPublicCertifications(String codeValue) {

        List<ProductionLotCertification> lotCertifications = productionLotCertificationRepository
                .findByTraceCode(codeValue);

        if (lotCertifications.isEmpty()) {
            return Collections.emptyList();
        }

        return lotCertifications.stream()
                .map(this::toPublicCertification)
                .toList();
    }

    private PublicCertificationResponse toPublicCertification(
            ProductionLotCertification lotCertification) {

        Certification certification = lotCertification.getCertification();

        CertificationStatus status = certification.getExpiryDate().isBefore(LocalDate.now())
                ? CertificationStatus.EXPIRED
                : CertificationStatus.VALID;

        return PublicCertificationResponse.builder()
                .certificationId(certification.getId())
                .standardId(certification.getStandard().getId())
                .certificationName(certification.getStandard().getName())
                .certificationCode(certification.getCode())
                .issuedBy(certification.getIssuedBy())
                .issueDate(certification.getIssueDate())
                .expiryDate(certification.getExpiryDate())
                .status(status)
                .statusLabel(status.getLabel())
                .build();
    }
}