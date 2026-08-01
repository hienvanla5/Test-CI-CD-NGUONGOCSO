package vn.nguongocso.event.service.impl;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import vn.nguongocso.common.annotation.Auditable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.alert.event.ActivityLogEvent;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.util.IpUtils;
import vn.nguongocso.event.dto.request.CorrectPackagingEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.request.RecordTransportEventRequest;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.ChainEventRepository;
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.service.ChainEventService;
import vn.nguongocso.event.service.EventValidationService;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ sự kiện chuỗi cung ứng.
 *
 * @author Team WEB 1
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class ChainEventServiceImpl implements ChainEventService {

    private final ChainEventRepository chainEventRepository;
    private final ProductionLotRepository productionLotRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final TraceCodeRepository traceCodeRepository;
    private final ShipmentRepository shipmentRepository;
    private final EventValidationService eventValidationService;

    private final ApplicationEventPublisher eventPublisher;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Override
    @Transactional
    @Auditable(action = "RECORD_HARVEST_EVENT", entityType = "CHAIN_EVENT", description = "'Ghi nhận sự kiện thu hoạch cho lô sản xuất ID: ' + #request.productionLotId + ', Sản lượng: ' + #request.quantity + ' kg'")
    public ChainEventResponse recordHarvestEvent(RecordHarvestEventRequest request, CustomUserDetails currentUser) {
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        try {
            if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
            }

            if (lot.getStatus() != ProductionLotStatus.APPROVED) {
                throw new BusinessException("Lô sản xuất chưa được duyệt, không thể ghi sự kiện thu hoạch.");
            }
        } catch (BusinessException e) {
            eventValidationService.logFailedAttempt(request.getProductionLotId(), lot.getName(), ChainEventType.HARVEST, e.getMessage(), currentUser);
            throw e;
        }

        lot.setStatus(ProductionLotStatus.HARVESTED);
        lot.setHarvestDate(request.getHarvestDate());
        lot.setActualQuantity(request.getQuantity());
        productionLotRepository.save(lot);

        Point locationPoint = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            locationPoint = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        Map<String, Object> eventDataMap = new HashMap<>();
        eventDataMap.put("productionLotId", lot.getId().toString());
        eventDataMap.put("productionLotName", lot.getName());
        eventDataMap.put("harvestDate", request.getHarvestDate().toString());
        eventDataMap.put("quantity", request.getQuantity());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(eventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        ChainEvent chainEvent = ChainEvent.builder()
                .eventType(ChainEventType.HARVEST)
                .eventData(eventDataJson)
                .location(locationPoint)
                .recordedAt(LocalDateTime.now())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(currentUser.getOrganizationId())
                .action("CREATE")
                .description("Ghi sự kiện thu hoạch cho lô " + lot.getName())
                .entityType("ChainEvent")
                .entityId(chainEvent.getId().toString())
                .ipAddress(IpUtils.getClientIp())
                .timestamp(LocalDateTime.now())
                .build()
        );

        return ChainEventResponse.builder()
                .id(chainEvent.getId())
                .eventType(chainEvent.getEventType())
                .eventData(eventDataMap)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .recordedAt(chainEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(chainEvent.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    @Auditable(action = "RECORD_PACKAGING_EVENT", entityType = "CHAIN_EVENT", description = "'Ghi nhận sự kiện đóng gói cho lô sản xuất ID: ' + #request.productionLotId + ', Quy cách: ' + #request.packagingSpecification")
    public ChainEventResponse recordPackagingEvent(RecordPackagingEventRequest request, CustomUserDetails currentUser) {
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        try {
            if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
            }

            if (lot.getStatus() != ProductionLotStatus.HARVESTED) {
                throw new BusinessException("Chỉ được ghi nhận sự kiện đóng gói cho lô đã thu hoạch.");
            }

            if (request.getPackagingDate().isAfter(LocalDate.now())) {
                throw new BusinessException("Ngày đóng gói không được là ngày ở tương lai.");
            }
            if (lot.getHarvestDate() != null && request.getPackagingDate().isBefore(lot.getHarvestDate())) {
                throw new BusinessException("Ngày đóng gói phải sau hoặc bằng ngày thu hoạch của lô sản xuất.");
            }
        } catch (BusinessException e) {
            eventValidationService.logFailedAttempt(request.getProductionLotId(), lot.getName(), ChainEventType.PACKAGING, e.getMessage(), currentUser);
            throw e;
        }

        lot.setStatus(ProductionLotStatus.PACKAGED);
        productionLotRepository.save(lot);

        Point locationPoint = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            locationPoint = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        Map<String, Object> eventDataMap = new HashMap<>();
        eventDataMap.put("productionLotId", lot.getId().toString());
        eventDataMap.put("productionLotName", lot.getName());
        eventDataMap.put("packagingSpecification", request.getPackagingSpecification());
        eventDataMap.put("packagingDate", request.getPackagingDate().toString());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(eventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        ChainEvent chainEvent = ChainEvent.builder()
                .eventType(ChainEventType.PACKAGING)
                .eventData(eventDataJson)
                .location(locationPoint)
                .recordedAt(LocalDateTime.now())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(currentUser.getOrganizationId())
                .action("CREATE")
                .description("Ghi sự kiện thu hoạch cho lô " + lot.getName())
                .entityType("ChainEvent")
                .entityId(chainEvent.getId().toString())
                .ipAddress(IpUtils.getClientIp())
                .timestamp(LocalDateTime.now())
                .build()
        );

        return ChainEventResponse.builder()
                .id(chainEvent.getId())
                .eventType(chainEvent.getEventType())
                .eventData(eventDataMap)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .recordedAt(chainEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(chainEvent.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    @Auditable(action = "CORRECT_PACKAGING_EVENT", entityType = "CHAIN_EVENT", description = "'Đính chính thông tin đóng gói cho sự kiện gốc ID: ' + #originalEventId")
    public ChainEventResponse correctPackagingEvent(UUID originalEventId, CorrectPackagingEventRequest request, CustomUserDetails currentUser) {
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        ChainEvent originalEvent = chainEventRepository.findById(originalEventId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy sự kiện đóng gói cần đính chính."));

        if (originalEvent.getEventType() != ChainEventType.PACKAGING) {
            throw new BusinessException("Sự kiện gốc không phải là sự kiện đóng gói.");
        }

        Map<String, Object> originalDataMap;
        try {
            originalDataMap = objectMapper.readValue(originalEvent.getEventData(), new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi giải mã dữ liệu sự kiện gốc.");
        }

        String productionLotIdStr = (String) originalDataMap.get("productionLotId");
        if (productionLotIdStr == null) {
            throw new BusinessException("Không tìm thấy thông tin lô sản xuất trong sự kiện gốc.");
        }
        UUID productionLotId = UUID.fromString(productionLotIdStr);

        ProductionLot lot = productionLotRepository.findById(productionLotId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        try {
            if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
            }

            if (request.getPackagingDate().isAfter(LocalDate.now())) {
                throw new BusinessException("Ngày đóng gói không được là ngày ở tương lai.");
            }
            if (lot.getHarvestDate() != null && request.getPackagingDate().isBefore(lot.getHarvestDate())) {
                throw new BusinessException("Ngày đóng gói phải sau hoặc bằng ngày thu hoạch của lô sản xuất.");
            }
        } catch (BusinessException e) {
            eventValidationService.logFailedAttempt(productionLotId, lot.getName(), ChainEventType.PACKAGING, e.getMessage(), currentUser);
            throw e;
        }

        Point locationPoint = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            locationPoint = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        Map<String, Object> eventDataMap = new HashMap<>();
        eventDataMap.put("productionLotId", lot.getId().toString());
        eventDataMap.put("productionLotName", lot.getName());
        eventDataMap.put("packagingSpecification", request.getPackagingSpecification());
        eventDataMap.put("packagingDate", request.getPackagingDate().toString());
        eventDataMap.put("correctionReason", request.getCorrectionReason());
        eventDataMap.put("parentEventId", originalEventId.toString());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(eventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        ChainEvent correctionEvent = ChainEvent.builder()
                .eventType(ChainEventType.PACKAGING)
                .eventData(eventDataJson)
                .location(locationPoint)
                .recordedAt(LocalDateTime.now())
                .recordedBy(actor)
                .parentEvent(originalEvent)
                .isCorrection(true)
                .build();

        correctionEvent = chainEventRepository.save(correctionEvent);

        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(currentUser.getOrganizationId())
                .action("CREATE")
                .description("Ghi sự kiện thu hoạch cho lô " + lot.getName())
                .entityType("ChainEvent")
                .entityId(correctionEvent.getId().toString())
                .ipAddress(IpUtils.getClientIp())
                .timestamp(LocalDateTime.now())
                .build()
        );

        return ChainEventResponse.builder()
                .id(correctionEvent.getId())
                .eventType(correctionEvent.getEventType())
                .eventData(eventDataMap)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .recordedAt(correctionEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(correctionEvent.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    @Auditable(action = "RECORD_TRANSPORT_EVENT", entityType = "CHAIN_EVENT", description = "'Ghi nhận sự kiện vận chuyển mã tem: ' + #request.codeValue + ', Từ: ' + #request.fromLocation + ', Đến: ' + #request.toLocation")
    public ChainEventResponse recordTransportEvent(
            RecordTransportEventRequest request,
            CustomUserDetails currentUser) {

        if (!"VT-03".equals(currentUser.getRoleCode())) {
            throw new BusinessException("Bạn không có quyền ghi sự kiện vận chuyển.");
        }

        TraceCode traceCode = traceCodeRepository.findByCodeValue(request.getCodeValue())
                .orElseThrow(() -> new BusinessException("Mã lô hàng không tồn tại."));

        Shipment shipment = traceCode.getShipment();
        if (shipment == null) {
            throw new BusinessException("Mã truy xuất chưa được gắn với lô hàng.");
        }

        try {
            if (!shipment.getOrganization().getOrganizationId()
                    .equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô hàng.");
            }

            if (shipment.getStatus() == ShipmentStatus.RECALLED) {
                throw new BusinessException("Lô hàng đã bị thu hồi, không thể ghi sự kiện vận chuyển.");
            }

            if (shipment.getStatus() != ShipmentStatus.ACTIVATED) {
                throw new BusinessException("Lô hàng chưa được kích hoạt, không thể ghi sự kiện vận chuyển.");
            }
        } catch (BusinessException e) {
            eventValidationService.logFailedAttempt(shipment.getId(), shipment.getName(), ChainEventType.TRANSPORT, e.getMessage(), currentUser);
            throw e;
        }

        Map<String, Object> eventDataMap = new HashMap<>();
        eventDataMap.put("fromLocation", request.getFromLocation());
        eventDataMap.put("toLocation", request.getToLocation());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(eventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        ChainEvent chainEvent = ChainEvent.builder()
                .shipment(shipment)
                .eventType(ChainEventType.TRANSPORT)
                .eventData(eventDataJson)
                .recordedAt(request.getTransportTime())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(currentUser.getOrganizationId())
                .action("CREATE")
                .description("Ghi sự kiện thu hoạch cho lô hàng " + shipment.getName())
                .entityType("ChainEvent")
                .entityId(chainEvent.getId().toString())
                .ipAddress(IpUtils.getClientIp())
                .timestamp(LocalDateTime.now())
                .build()
        );

        return ChainEventResponse.builder()
                .id(chainEvent.getId())
                .shipmentId(shipment.getId())
                .eventType(chainEvent.getEventType())
                .eventData(eventDataMap)
                .latitude(null)
                .longitude(null)
                .recordedAt(chainEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(chainEvent.getCreatedAt())
                .build();
    }

    @Override
    public List<ChainEventResponse> getShipmentTimeline(UUID shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException("Lô hàng không tồn tại."));

        List<ChainEvent> shipmentEvents = chainEventRepository.findByShipmentIdOrderByRecordedAtAsc(shipmentId);

        List<ChainEvent> productionLotEvents = Collections.emptyList();
        if (shipment.getProductionLot() != null) {
            UUID productionLotId = shipment.getProductionLot().getId();
            List<ChainEvent> allUnassignedEvents = chainEventRepository.findByShipmentIsNullAndEventTypeIn(
                    List.of(ChainEventType.HARVEST, ChainEventType.PACKAGING)
            );
            productionLotEvents = allUnassignedEvents.stream()
                    .filter(e -> {
                        Map<String, Object> data = parseEventData(e.getEventData());
                        Object lotId = data.get("productionLotId");
                        return lotId != null && lotId.toString().equals(productionLotId.toString());
                    })
                    .collect(Collectors.toList());
        }

        List<ChainEvent> allEvents = new ArrayList<>();
        allEvents.addAll(shipmentEvents);
        allEvents.addAll(productionLotEvents);
        allEvents.sort(Comparator.comparing(ChainEvent::getRecordedAt));

        return allEvents.stream()
                .map(this::toChainEventResponse)
                .collect(Collectors.toList());
    }

    private Map<String, Object> parseEventData(String eventDataJson) {
        if (eventDataJson == null || eventDataJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(eventDataJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Không thể parse eventData: {}", eventDataJson);
            return new HashMap<>();
        }
    }

    private ChainEventResponse toChainEventResponse(ChainEvent event) {
        Map<String, Object> eventDataMap = parseEventData(event.getEventData());

        Double latitude = null;
        Double longitude = null;
        if (event.getLocation() != null) {
            latitude = event.getLocation().getY();
            longitude = event.getLocation().getX();
        }

        String recordedByName = event.getRecordedBy() != null
                ? event.getRecordedBy().getFullName()
                : null;

        return ChainEventResponse.builder()
                .id(event.getId())
                .shipmentId(event.getShipment() != null ? event.getShipment().getId() : null)
                .eventType(event.getEventType())
                .eventData(eventDataMap)
                .latitude(latitude)
                .longitude(longitude)
                .recordedAt(event.getRecordedAt())
                .recordedByName(recordedByName)
                .createdAt(event.getCreatedAt())
                .build();
    }
}