package vn.nguongocso.event.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import vn.nguongocso.event.dto.request.RecordHarvestEventRequest;
import vn.nguongocso.event.dto.request.RecordPackagingEventRequest;
import vn.nguongocso.event.dto.response.ChainEventResponse;
import vn.nguongocso.event.entity.ChainEvent;
import vn.nguongocso.event.enums.ChainEventType;
import vn.nguongocso.event.repository.ChainEventRepository;
import vn.nguongocso.event.service.ChainEventService;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChainEventServiceImpl implements ChainEventService {

    private static final String ORG_MANAGER_ROLE = "VT-02";
    private static final String EVENT_RECORDER_ROLE = "VT-03";

    private final ChainEventRepository chainEventRepository;
    private final ProductionLotRepository productionLotRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Override
    @Transactional
    public ChainEventResponse recordHarvestEvent(
            RecordHarvestEventRequest request,
            CustomUserDetails currentUser
    ) {
        validateRecorder(currentUser);

        ProductionLot productionLot =
                getOwnedProductionLot(request.getProductionLotId(), currentUser);

        if (productionLot.getStatus() != ProductionLotStatus.APPROVED) {
            throw new BusinessException(
                    "Chỉ được ghi nhận thu hoạch cho lô ở trạng thái APPROVED"
            );
        }

        validateHarvestDate(productionLot, request.getHarvestDate());

        productionLot.setHarvestDate(request.getHarvestDate());
        productionLot.setActualQuantity(request.getQuantity());
        productionLot.setStatus(ProductionLotStatus.HARVESTED);
        productionLotRepository.save(productionLot);

        Map<String, Object> eventData = new LinkedHashMap<>();
        eventData.put("productionLotId", productionLot.getId().toString());
        eventData.put("productionLotName", productionLot.getName());
        eventData.put("harvestDate", request.getHarvestDate().toString());
        eventData.put("quantity", request.getQuantity());
        eventData.put("productionLotStatus", ProductionLotStatus.HARVESTED.name());

        return createChainEvent(
                ChainEventType.HARVEST,
                eventData,
                request.getLatitude(),
                request.getLongitude(),
                currentUser
        );
    }

    @Override
    @Transactional
    public ChainEventResponse recordPackagingEvent(
            RecordPackagingEventRequest request,
            CustomUserDetails currentUser
    ) {
        validateRecorder(currentUser);

        ProductionLot productionLot =
                getOwnedProductionLot(request.getProductionLotId(), currentUser);

        if (productionLot.getStatus() != ProductionLotStatus.HARVESTED) {
            throw new BusinessException(
                    "Chỉ được ghi nhận đóng gói cho lô ở trạng thái HARVESTED"
            );
        }

        validatePackagingDate(productionLot, request.getPackagingDate());

        productionLot.setStatus(ProductionLotStatus.PACKAGED);
        productionLotRepository.save(productionLot);

        Map<String, Object> eventData = new LinkedHashMap<>();
        eventData.put("productionLotId", productionLot.getId().toString());
        eventData.put("productionLotName", productionLot.getName());
        eventData.put("packagingDate", request.getPackagingDate().toString());
        eventData.put(
                "packagingSpecification",
                request.getPackagingSpecification().trim()
        );
        eventData.put("productionLotStatus", ProductionLotStatus.PACKAGED.name());

        return createChainEvent(
                ChainEventType.PACKAGING,
                eventData,
                request.getLatitude(),
                request.getLongitude(),
                currentUser
        );
    }

    private void validateRecorder(CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Không tìm thấy thông tin người dùng");
        }

        String roleCode = currentUser.getRoleCode();

        if (
                !ORG_MANAGER_ROLE.equals(roleCode) &&
                !EVENT_RECORDER_ROLE.equals(roleCode)
        ) {
            throw new BusinessException(
                    "Bạn không có quyền ghi nhận sự kiện chuỗi cung ứng"
            );
        }
    }

    private ProductionLot getOwnedProductionLot(
            java.util.UUID productionLotId,
            CustomUserDetails currentUser
    ) {
        ProductionLot productionLot =
                productionLotRepository.findById(productionLotId)
                        .orElseThrow(
                                () -> new BusinessException(
                                        "Không tìm thấy lô sản xuất"
                                )
                        );

        if (
                !productionLot
                        .getOrganization()
                        .getOrganizationId()
                        .equals(currentUser.getOrganizationId())
        ) {
            throw new BusinessException(
                    "Lô sản xuất không thuộc tổ chức của bạn"
            );
        }

        return productionLot;
    }

    private void validateHarvestDate(
            ProductionLot productionLot,
            LocalDate harvestDate
    ) {
        if (harvestDate.isAfter(LocalDate.now())) {
            throw new BusinessException(
                    "Ngày thu hoạch không được ở tương lai"
            );
        }

        if (
                productionLot.getPlantingDate() != null &&
                harvestDate.isBefore(productionLot.getPlantingDate())
        ) {
            throw new BusinessException(
                    "Ngày thu hoạch phải sau hoặc bằng ngày gieo trồng"
            );
        }
    }

    private void validatePackagingDate(
            ProductionLot productionLot,
            LocalDate packagingDate
    ) {
        if (packagingDate.isAfter(LocalDate.now())) {
            throw new BusinessException(
                    "Ngày đóng gói không được ở tương lai"
            );
        }

        if (
                productionLot.getHarvestDate() != null &&
                packagingDate.isBefore(productionLot.getHarvestDate())
        ) {
            throw new BusinessException(
                    "Ngày đóng gói phải sau hoặc bằng ngày thu hoạch"
            );
        }
    }

    private ChainEventResponse createChainEvent(
            ChainEventType eventType,
            Map<String, Object> eventData,
            Double latitude,
            Double longitude,
            CustomUserDetails currentUser
    ) {
        Point location = createLocation(latitude, longitude);

        User actor =
                userRepository.findById(currentUser.getUserId())
                        .orElseThrow(
                                () -> new BusinessException(
                                        "Không tìm thấy thông tin người ghi nhận"
                                )
                        );

        ChainEvent event = ChainEvent.builder()
                .eventType(eventType)
                .eventData(toJson(eventData))
                .location(location)
                .recordedAt(LocalDateTime.now())
                .recordedBy(actor)
                .isCorrection(false)
                .build();

        ChainEvent savedEvent =
                chainEventRepository.save(event);

        return ChainEventResponse.builder()
                .id(savedEvent.getId())
                .eventType(savedEvent.getEventType())
                .eventData(eventData)
                .latitude(latitude)
                .longitude(longitude)
                .recordedAt(savedEvent.getRecordedAt())
                .recordedByName(actor.getFullName())
                .createdAt(savedEvent.getCreatedAt())
                .build();
    }

    private Point createLocation(Double latitude, Double longitude) {
        if (latitude == null && longitude == null) {
            return null;
        }

        if (latitude == null || longitude == null) {
            throw new BusinessException(
                    "Vui lòng cung cấp đầy đủ vĩ độ và kinh độ"
            );
        }

        if (
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
        ) {
            throw new BusinessException(
                    "Tọa độ địa lý không hợp lệ"
            );
        }

        return geometryFactory.createPoint(
                new Coordinate(longitude, latitude)
        );
    }

    private String toJson(Map<String, Object> eventData) {
        try {
            return objectMapper.writeValueAsString(eventData);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    "Không thể lưu dữ liệu sự kiện"
            );
        }
    }
}
