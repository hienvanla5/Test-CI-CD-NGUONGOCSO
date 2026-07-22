package vn.nguongocso.farm.service.impl;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.farm.service.FarmLogService;

/**
 * Triển khai dịch vụ quản lý nhật ký canh tác.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class FarmLogServiceImpl implements FarmLogService {

	private final FarmLogRepository farmLogRepository;
	private final ProductionLotRepository productionLotRepository;
	private static final String EVENT_RECORDER_ROLE = "VT-03";

    /**
     * Tạo nhật ký canh tác.
     *
     * @param request thông tin nhật ký
     * @return thông tin nhật ký đã tạo
     */
	@Override
	public FarmLogResponse create(CreateFarmLogRequest request) {

		CustomUserDetails currentUser = getCurrentUser();
		
		validateRole(currentUser);

		ProductionLot productionLot = getProductionLot(request.getProductionLotId());
		
		validateProductionLotStatus(productionLot);
		
		validateOrganizationAccess(currentUser, productionLot);

		FarmLog farmLog = buildFarmLog(request, productionLot, currentUser.getUser());

		FarmLog saved = farmLogRepository.save(farmLog);

		return toResponse(saved);
	}

	private CustomUserDetails getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return (CustomUserDetails) authentication.getPrincipal();
	}

	private ProductionLot getProductionLot(UUID productionLotId) {
		return productionLotRepository.findById(productionLotId)
				.orElseThrow(() -> new BusinessException("Không tìm thấy lô sản xuất"));
	}

	private FarmLog buildFarmLog(CreateFarmLogRequest request, ProductionLot productionLot, User createdBy) {

		return FarmLog.builder().productionLotId(productionLot).activityType(request.getActivityType())
				.material(request.getMaterial()).quantity(request.getQuantity()).unit(request.getUnit())
				.executedDate(request.getExecutedDate()).notes(request.getNotes()).createdBy(createdBy).build();
	}

	private FarmLogResponse toResponse(FarmLog farmLog) {

	    return FarmLogResponse.builder()
	            .id(farmLog.getId())

	            .productionLotId(farmLog.getProductionLotId().getId())
	            .productionLotName(farmLog.getProductionLotId().getName())

	            .activityType(farmLog.getActivityType())
	            .material(farmLog.getMaterial())
	            .quantity(farmLog.getQuantity())
	            .unit(farmLog.getUnit())
	            .executedDate(farmLog.getExecutedDate())
	            .notes(farmLog.getNotes())

	            .createdByName(farmLog.getCreatedBy().getFullName())
	            .createdAt(farmLog.getCreatedAt())
	            .build();
	}

	private void validateOrganizationAccess(
	        CustomUserDetails currentUser,
	        ProductionLot productionLot) {

	    if (!productionLot.getFarmArea()
	            .getOrganization()
	            .getOrganizationId()
	            .equals(currentUser.getOrganizationId())) {

	        throw new BusinessException(
	            "Bạn không thuộc tổ chức của lô sản xuất.");
	    }
	}
	
	private void validateRole(CustomUserDetails currentUser) {
	    if (!EVENT_RECORDER_ROLE.equals(currentUser.getRoleCode())) {
	        throw new BusinessException("Bạn không có quyền ghi nhật ký canh tác.");
	    }
	}
	
	private void validateProductionLotStatus(ProductionLot productionLot) {

	    if (productionLot.getStatus() != ProductionLotStatus.APPROVED
	            && productionLot.getStatus() != ProductionLotStatus.HARVESTED) {

	        throw new BusinessException(
	                "Chỉ được ghi nhật ký cho lô đã duyệt hoặc đang thu hoạch.");
	    }
	}
}