package vn.nguongocso.event.service.impl;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import vn.nguongocso.common.annotation.Auditable;
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
import vn.nguongocso.event.dto.request.*;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.ChainEventRepository;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.service.ChainEventService;
import vn.nguongocso.event.service.EventValidationService;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.repository.TraceCodeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý nghiệp vụ sự kiện chuỗi cung ứng.
 *
 * @author Team WEB 1
 */



@Service
@RequiredArgsConstructor
public class ChainEventServiceImpl implements ChainEventService {

    private final ChainEventRepository chainEventRepository;
    private final ProductionLotRepository productionLotRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final TraceCodeRepository traceCodeRepository;
    private final EventValidationService eventValidationService;
    

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
        // 1. Kiểm tra vai trò
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        // 2. Tìm lô sản xuất
        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        try {
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
        } catch (BusinessException e) {
            eventValidationService.logFailedAttempt(request.getProductionLotId(), lot.getName(), ChainEventType.PACKAGING, e.getMessage(), currentUser);
            throw e;
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
    @Auditable(action = "CORRECT_PACKAGING_EVENT", entityType = "CHAIN_EVENT", description = "'Đính chính thông tin đóng gói cho sự kiện gốc ID: ' + #originalEventId")
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
    
    
    @Override
    @Transactional
    @Auditable(action = "RECORD_TRANSPORT_EVENT", entityType = "CHAIN_EVENT", description = "'Ghi nhận sự kiện vận chuyển mã tem: ' + #request.codeValue + ', Từ: ' + #request.fromLocation + ', Đến: ' + #request.toLocation")
    public ChainEventResponse recordTransportEvent(
            RecordTransportEventRequest request,
            CustomUserDetails currentUser) {

        // 1. Kiểm tra quyền
        if (!"VT-03".equals(currentUser.getRoleCode())) {
            throw new BusinessException("Bạn không có quyền ghi sự kiện vận chuyển.");
        }

        // 2. Tìm mã truy xuất
        TraceCode traceCode = traceCodeRepository.findByCodeValue(request.getCodeValue())
                .orElseThrow(() -> new BusinessException("Mã lô hàng không tồn tại."));

        // 3. Lấy lô hàng
        Shipment shipment = traceCode.getShipment();
        
        if (shipment == null) {
            throw new BusinessException("Mã truy xuất chưa được gắn với lô hàng.");
        }
        
        try {
            if (!shipment.getOrganization().getOrganizationId()
                    .equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô hàng.");
            }
            
            // 4. Kiểm tra trạng thái lô hàng
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

        // 5. Dữ liệu sự kiện
        Map<String, Object> eventDataMap = new HashMap<>();
        eventDataMap.put("fromLocation", request.getFromLocation());
        eventDataMap.put("toLocation", request.getToLocation());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(eventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        // 6. Người ghi nhận
        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        // 7. Tạo ChainEvent
        ChainEvent chainEvent = ChainEvent.builder()
                .shipment(shipment)
                .eventType(ChainEventType.TRANSPORT)
                .eventData(eventDataJson)
                .recordedAt(request.getTransportTime())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

        // 8. Response
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
    @Transactional
    public ChainEventResponse recordMobileEvent(RecordMobileEventRequest request, CustomUserDetails currentUser) {
        // 1. Kiểm tra vai trò người ghi sự kiện (Quy tắc QTN-07)
        String role = currentUser.getRoleCode();
        if (!"VT-02".equals(role) && !"VT-03".equals(role)) {
            throw new BusinessException("Chỉ thành viên được cấp quyền trong tổ chức mới được ghi sự kiện.");
        }

        // 2. Tìm kiếm lô sản xuất
        ProductionLot lot = productionLotRepository.findById(request.getProductionLotId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất."));

        try {
            // 3. Kiểm tra quyền sở hữu lô của tổ chức (Xử lý AC-03: Không được phân công lô)
            if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
                throw new BusinessException("Bạn không thuộc tổ chức quản lý của lô sản xuất này.");
            }

            // 4. Kiểm tra thời điểm ghi nhận không ở tương lai
            if (request.getRecordedAt().isAfter(LocalDateTime.now())) {
                throw new BusinessException("Thời điểm ghi nhận không được là thời gian ở tương lai.");
            }

            // 5. Phân loại và xử lý logic nghiệp vụ đặc thù (Tái sử dụng dịch vụ chung)
            if (request.getEventType() == ChainEventType.HARVEST) {
                // Kiểm tra trạng thái lô sản xuất phải là APPROVED mới được thu hoạch
                if (lot.getStatus() != ProductionLotStatus.APPROVED) {
                    throw new BusinessException("Lô sản xuất chưa được duyệt, không thể ghi sự kiện thu hoạch.");
                }

                Object quantityObj = request.getEventData().get("quantity");
                Object harvestDateStrObj = request.getEventData().get("harvestDate");

                if (quantityObj == null || harvestDateStrObj == null) {
                    throw new BusinessException("Thiếu dữ liệu sản lượng hoặc ngày thu hoạch.");
                }

                Double quantity = Double.valueOf(quantityObj.toString());
                if (quantity <= 0) {
                    throw new BusinessException("Sản lượng thu hoạch phải lớn hơn 0");
                }

                LocalDate harvestDate = LocalDate.parse(harvestDateStrObj.toString());
                if (harvestDate.isAfter(LocalDate.now())) {
                    throw new BusinessException("Ngày thu hoạch không được là ngày ở tương lai.");
                }

                // Cập nhật trạng thái lô sản xuất sang HARVESTED
                lot.setStatus(ProductionLotStatus.HARVESTED);
                lot.setHarvestDate(harvestDate);
                lot.setActualQuantity(quantity);
                productionLotRepository.save(lot);

            } else if (request.getEventType() == ChainEventType.PACKAGING) {
                // Kiểm tra trạng thái lô sản xuất phải là HARVESTED mới được đóng gói
                if (lot.getStatus() != ProductionLotStatus.HARVESTED) {
                    throw new BusinessException("Chỉ được ghi nhận sự kiện đóng gói cho lô đã thu hoạch.");
                }

                Object specObj = request.getEventData().get("packagingSpecification");
                Object packagingDateStrObj = request.getEventData().get("packagingDate");

                if (specObj == null || packagingDateStrObj == null) {
                    throw new BusinessException("Thiếu thông tin quy cách hoặc ngày đóng gói.");
                }

                String packagingSpecification = specObj.toString();
                if (packagingSpecification.trim().isEmpty()) {
                    throw new BusinessException("Quy cách đóng gói không được để trống");
                }
                if (packagingSpecification.length() > 255) {
                    throw new BusinessException("Quy cách đóng gói không được vượt quá 255 ký tự");
                }

                LocalDate packagingDate = LocalDate.parse(packagingDateStrObj.toString());
                if (packagingDate.isAfter(LocalDate.now())) {
                    throw new BusinessException("Ngày đóng gói không được là ngày ở tương lai.");
                }
                if (lot.getHarvestDate() != null && packagingDate.isBefore(lot.getHarvestDate())) {
                    throw new BusinessException("Ngày đóng gói phải sau hoặc bằng ngày thu hoạch của lô sản xuất.");
                }

                // Cập nhật trạng thái lô sản xuất sang PACKAGED
                lot.setStatus(ProductionLotStatus.PACKAGED);
                productionLotRepository.save(lot);

            } else {
                throw new BusinessException("Loại sự kiện không được hỗ trợ ghi nhận từ thiết bị di động.");
            }

        } catch (BusinessException e) {
            // Ghi nhận nhật ký thất bại vào bảng logs khi phát sinh lỗi nghiệp vụ (Xử lý AC-04)
            eventValidationService.logFailedAttempt(
                    request.getProductionLotId(),
                    lot.getName(),
                    request.getEventType(),
                    e.getMessage(),
                    currentUser
            );
            throw e;
        }

        // 6. Tạo tọa độ GPS địa điểm (SRID 4326)
        Point locationPoint = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));

        // 7. Chuẩn bị dữ liệu lưu vào eventData JSON (Chứa thông tin ảnh thực địa và thiết bị nguồn)
        Map<String, Object> finalEventDataMap = new HashMap<>();
        finalEventDataMap.put("productionLotId", lot.getId().toString());
        finalEventDataMap.put("productionLotName", lot.getName());
        finalEventDataMap.put("images", request.getImages());
        finalEventDataMap.put("deviceSource", request.getDeviceSource() != null ? request.getDeviceSource() : "MOBILE");

        // Gộp dữ liệu chi tiết của sự kiện
        finalEventDataMap.putAll(request.getEventData());

        String eventDataJson;
        try {
            eventDataJson = objectMapper.writeValueAsString(finalEventDataMap);
        } catch (JsonProcessingException e) {
            throw new BusinessException("Lỗi chuyển đổi dữ liệu sự kiện sang chuỗi JSON.");
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin người ghi nhận."));

        // 8. Tạo và lưu thực thể ChainEvent
        ChainEvent chainEvent = ChainEvent.builder()
                .eventType(request.getEventType())
                .eventData(eventDataJson)
                .location(locationPoint)
                .recordedAt(request.getRecordedAt())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        chainEvent = chainEventRepository.save(chainEvent);

        // 9. Trả về thông tin phản hồi thành công
        return ChainEventResponse.builder()
                .id(chainEvent.getId())
                .eventType(chainEvent.getEventType())
                .eventData(finalEventDataMap)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .recordedAt(chainEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(chainEvent.getCreatedAt())
                .build();
    }


}

