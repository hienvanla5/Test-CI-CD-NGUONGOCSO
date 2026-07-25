package vn.nguongocso.event.service.impl;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.event.dto.request.CorrectPackagingEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChainEventServiceImpl implements ChainEventService {

    private final ChainEventRepository chainEventRepository;
    private final ProductionLotRepository productionLotRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Override
    @Transactional
    public ChainEventResponse recordHarvestEvent(RecordHarvestEventRequest request, CustomUserDetails currentUser) {
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));


        if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
            throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
        }


        if (lot.getStatus() != ProductionLotStatus.APPROVED) {
            throw new BusinessException("Lô sản xuất chưa được duyệt, không thể ghi sự kiện thu hoạch.");
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
    public ChainEventResponse recordPackagingEvent(RecordPackagingEventRequest request, CustomUserDetails currentUser) {
        // 1. Kiểm tra vai trò
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        // 2. Tìm lô sản xuất
        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        // 3. Kiểm tra tổ chức quản lý
        if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
            throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
        }

        // 4. Kiểm tra trạng thái lô sản xuất (Phải là HARVESTED)
        if (lot.getStatus() != ProductionLotStatus.HARVESTED) {
            throw new BusinessException("Chỉ được ghi nhận sự kiện đóng gói cho lô đã thu hoạch.");
        }

        // 5. Kiểm tra tính hợp lệ của ngày đóng gói
        if (request.getPackagingDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Ngày đóng gói không được là ngày ở tương lai.");
        }
        if (lot.getHarvestDate() != null && request.getPackagingDate().isBefore(lot.getHarvestDate())) {
            throw new BusinessException("Ngày đóng gói phải sau hoặc bằng ngày thu hoạch của lô sản xuất.");
        }

        // 6. Chuyển trạng thái lô sang PACKAGED
        lot.setStatus(ProductionLotStatus.PACKAGED);
        productionLotRepository.save(lot);

        // 7. Tạo tọa độ địa điểm đóng gói
        Point locationPoint = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            locationPoint = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        // 8. Đóng gói dữ liệu dạng JSON
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

        // 9. Lưu ChainEvent mới
        ChainEvent chainEvent = ChainEvent.builder()
                .eventType(ChainEventType.PACKAGING)
                .eventData(eventDataJson)
                .location(locationPoint)
                .recordedAt(LocalDateTime.now())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

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
    public ChainEventResponse correctPackagingEvent(UUID originalEventId, CorrectPackagingEventRequest request, CustomUserDetails currentUser) {
        // 1. Kiểm tra vai trò
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

        if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
            throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
        }

        if (request.getPackagingDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Ngày đóng gói không được là ngày ở tương lai.");
        }
        if (lot.getHarvestDate() != null && request.getPackagingDate().isBefore(lot.getHarvestDate())) {
            throw new BusinessException("Ngày đóng gói phải sau hoặc bằng ngày thu hoạch của lô sản xuất.");
        }

        // 7. Tạo tọa độ địa điểm
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

}

