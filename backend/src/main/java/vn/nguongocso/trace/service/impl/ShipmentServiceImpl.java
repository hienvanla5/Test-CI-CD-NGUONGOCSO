package vn.nguongocso.trace.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.enums.ProductionLotStatus;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.notification.NotificationService;
import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.entity.CodeRange;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.enums.TraceCodeStatus;
import vn.nguongocso.trace.repository.CodeRangeRepository;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;
import vn.nguongocso.trace.service.ShipmentService;
import vn.nguongocso.trace.dto.response.TraceCodeResponse;

/**
 * Service xử lý nghiệp vụ quản lý lô hàng và sinh mã truy xuất.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

	private final ShipmentRepository shipmentRepository;
	private final TraceCodeRepository traceCodeRepository;
	private final CodeRangeRepository codeRangeRepository;
	private final ProductionLotRepository productionLotRepository;

	private final NotificationService notificationService;

	private static final String ORG_MANAGER_ROLE = "VT-02";

	private static final String ORGANIZATION_ACCESS_MESSAGE = "Bạn không thuộc tổ chức của lô sản xuất.";

	private static final String INVALID_LOT_STATUS_MESSAGE = "Chỉ có thể tạo lô hàng từ lô sản xuất đã đóng gói.";

	private static final String CODE_RANGE_NOT_FOUND_MESSAGE = "Tổ chức chưa được cấp dải mã truy xuất.";

	private static final String CODE_RANGE_LIMIT_EXCEEDED_MESSAGE = "Số lượng tem vượt quá hạn mức dải mã còn lại.";

	private static final String PRODUCTION_LOT_NOT_FOUND_MESSAGE = "Không tìm thấy lô sản xuất.";

	/**
	 * Tạo lô hàng và sinh mã truy xuất cho lô sản xuất.
	 *
	 * @param request thông tin tạo lô hàng
	 * @return thông tin lô hàng sau khi tạo
	 * @throws BusinessException nếu không đủ điều kiện tạo lô hàng
	 */
	@Override
	public ShipmentResponse createShipment(CreateShipmentRequest request) {

		CustomUserDetails currentUser = getCurrentUser();

		validateRole(currentUser, ORG_MANAGER_ROLE, "Bạn không có quyền tạo lô hàng.");

		ProductionLot productionLot = findProductionLot(request.getProductionLotId());

		validateOrganization(currentUser, productionLot);

		validateProductionLotStatus(productionLot);

		CodeRange codeRange = findAvailableCodeRange(currentUser);

		validateCodeRangeLimit(codeRange, request.getTotalQuantity());

		Shipment shipment = createShipmentEntity(request, productionLot, currentUser);

		shipmentRepository.save(shipment);

		List<TraceCode> traceCodes = generateTraceCodes(shipment, codeRange, request.getTotalQuantity());

		traceCodes = traceCodeRepository.saveAll(traceCodes);

		updateCodeRange(codeRange, request.getTotalQuantity());
		codeRangeRepository.save(codeRange);

		shipment.setStatus(ShipmentStatus.CODE_PRINTED);

		return buildShipmentResponse(shipment, traceCodes, currentUser.getFullName());
	}

	private CustomUserDetails getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		return (CustomUserDetails) authentication.getPrincipal();
	}

	private void validateRole(CustomUserDetails currentUser, String expectedRole, String message) {

		if (!expectedRole.equals(currentUser.getRoleCode())) {
			throw new BusinessException(message);
		}
	}

	private ProductionLot findProductionLot(UUID productionLotId) {

		return productionLotRepository.findById(productionLotId)
				.orElseThrow(() -> new BusinessException(PRODUCTION_LOT_NOT_FOUND_MESSAGE));
	}

	private void validateOrganization(CustomUserDetails currentUser, ProductionLot productionLot) {

		if (!productionLot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {

			throw new BusinessException(ORGANIZATION_ACCESS_MESSAGE);
		}
	}

	private void validateProductionLotStatus(ProductionLot productionLot) {

		if (productionLot.getStatus() != ProductionLotStatus.PACKAGED) {

			throw new BusinessException(INVALID_LOT_STATUS_MESSAGE);
		}
	}

	private CodeRange findAvailableCodeRange(CustomUserDetails currentUser) {

		return codeRangeRepository.findByOrganizationOrganizationId(currentUser.getOrganizationId())
				.orElseThrow(() -> new BusinessException(CODE_RANGE_NOT_FOUND_MESSAGE));
	}

	private void validateCodeRangeLimit(CodeRange codeRange, long requiredQuantity) {

		long remaining = Math.max(0, codeRange.getTotalLimit() - codeRange.getUsedCount());

		if (requiredQuantity > remaining) {

			throw new BusinessException(CODE_RANGE_LIMIT_EXCEEDED_MESSAGE);
		}
	}

	private Shipment createShipmentEntity(CreateShipmentRequest request, ProductionLot productionLot,
			CustomUserDetails currentUser) {

		Shipment shipment = new Shipment();

		shipment.setProductionLot(productionLot);
		shipment.setOrganization(productionLot.getOrganization());

		shipment.setName(request.getName());
		shipment.setTotalQuantity(request.getTotalQuantity());
		shipment.setPackagingInfo(request.getPackagingInfo());

		shipment.setStatus(ShipmentStatus.DRAFT);

		User createdBy = new User();
		createdBy.setUserId(currentUser.getUserId());

		shipment.setCreatedBy(createdBy);

		return shipment;
	}

	private List<TraceCode> generateTraceCodes(Shipment shipment, CodeRange codeRange, long quantity) {

		List<TraceCode> traceCodes = new ArrayList<>();

		long startSequence = codeRange.getUsedCount() + 1;

		for (long i = 0; i < quantity; i++) {

			TraceCode traceCode = new TraceCode();

			traceCode.setShipment(shipment);

			traceCode.setCodeValue(generateUniqueCode(codeRange.getPrefix(), startSequence + i));

			traceCode.setStatus(TraceCodeStatus.INACTIVE);

			traceCodes.add(traceCode);
		}

		return traceCodes;
	}

	private String generateUniqueCode(String prefix, long sequence) {

		return prefix + String.format("%08d", sequence);
	}

	private void updateCodeRange(CodeRange codeRange, long quantity) {

		codeRange.setUsedCount(codeRange.getUsedCount() + quantity);
	}

	private ShipmentResponse buildShipmentResponse(Shipment shipment, List<TraceCode> traceCodes,
			String createdByName) {

		return ShipmentResponse.builder().id(shipment.getId()).productionLotId(shipment.getProductionLot().getId())
				.productionLotName(shipment.getProductionLot().getName()).name(shipment.getName())
				.totalQuantity(shipment.getTotalQuantity()).packagingInfo(shipment.getPackagingInfo())
				.status(shipment.getStatus())
				.traceCodes(traceCodes.stream()
						.map(traceCode -> TraceCodeResponse.builder().id(traceCode.getId())
								.codeValue(traceCode.getCodeValue()).qrImage(traceCode.getQrImage())
								.status(traceCode.getStatus()).build())
						.toList())
				.createdByName(createdByName).createdAt(shipment.getCreatedAt()).build();
	}

	private void checkAndSendAlert(CodeRange range) {
		double percent = (double) range.getUsedCount() / range.getTotalLimit() * 100;
		if (percent >= 80 && percent < 100) {
			notificationService.sendAlert(
					"Cảnh báo: Dải mã " + range.getPrefix() + " đã sử dụng " + range.getUsedCount() + "/" + range.getTotalLimit() + " (gần mức hết hạn)"
			);
		} else if (percent >= 100) {
			notificationService.sendAlert(
					"Cảnh báo: Dải mã " + range.getPrefix() + " đã vượt hạn mức " + range.getTotalLimit() + "!"
			);
		}
	}
}
