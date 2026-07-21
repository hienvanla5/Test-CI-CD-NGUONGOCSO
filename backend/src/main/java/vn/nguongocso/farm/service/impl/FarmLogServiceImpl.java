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

@Service
@Transactional
@RequiredArgsConstructor
public class FarmLogServiceImpl implements FarmLogService {

	private final FarmLogRepository farmLogRepository;
	private final ProductionLotRepository productionLotRepository;

	@Override
	public FarmLogResponse create(CreateFarmLogRequest request) {

		CustomUserDetails currentUser = getCurrentUser();

		ProductionLot productionLot = getProductionLot(request.getProductionLotId());
		
		validateProductionLotStatus(productionLot);
		
		validatePermission(currentUser, productionLot);

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

	private void validatePermission(CustomUserDetails currentUser, ProductionLot productionLot) {

		if (!productionLot.getFarmArea().getOrganization().getOrganizationId()
				.equals(currentUser.getOrganizationId())) {

			throw new BusinessException("Bạn không có quyền ghi nhật ký cho lô sản xuất này");
		}
	}
	
	private void validateProductionLotStatus(ProductionLot productionLot) {

	    if (productionLot.getStatus() != ProductionLotStatus.APPROVED) {
	        throw new BusinessException("Lô sản xuất chưa được duyệt.");
	    }
	}
}