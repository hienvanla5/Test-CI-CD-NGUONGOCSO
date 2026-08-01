package vn.nguongocso.trace.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import vn.nguongocso.alert.service.AlertNotificationService;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.trace.dto.request.RecallRequest;
import vn.nguongocso.trace.dto.response.RecallInfoResponse;
import vn.nguongocso.trace.dto.response.RecallResponse;
import vn.nguongocso.trace.entity.Recall;
import vn.nguongocso.trace.entity.Shipment;
import vn.nguongocso.trace.entity.TraceCode;
import vn.nguongocso.trace.enums.RecallStatus;
import vn.nguongocso.trace.enums.ShipmentStatus;
import vn.nguongocso.trace.enums.TraceCodeStatus;
import vn.nguongocso.trace.repository.RecallRepository;
import vn.nguongocso.trace.repository.ShipmentRepository;
import vn.nguongocso.trace.repository.TraceCodeRepository;
import vn.nguongocso.trace.service.ShipmentRecallService;

/**
 * Triển khai dịch vụ thu hồi lô hàng.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ShipmentRecallServiceImpl implements ShipmentRecallService {

    private static final String ORG_MANAGER_ROLE = "VT-02";

    private static final String MSG_SHIPMENT_NOT_FOUND = "Không tìm thấy lô hàng.";
    private static final String MSG_SHIPMENT_ALREADY_RECALLED = "Lô hàng đã được thu hồi trước đó.";
    private static final String MSG_USER_NOT_FOUND = "Người dùng không tồn tại.";
    private static final String MSG_NO_PERMISSION = "Bạn không có quyền thu hồi lô hàng.";
    private static final String MSG_NO_PERMISSION_OTHER_ORG = "Bạn không có quyền thu hồi lô hàng của tổ chức khác.";

    private final ShipmentRepository shipmentRepository;
    private final TraceCodeRepository traceCodeRepository;
    private final RecallRepository recallRepository;
    private final UserRepository userRepository;
    private final AlertNotificationService alertNotificationService;

    /**
     * {@inheritDoc}
     */
    @Override
    public RecallResponse recallShipment(
            UUID shipmentId,
            RecallRequest request) {

        CustomUserDetails currentUser = getCurrentUser();

        validateRole(currentUser);

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException(MSG_SHIPMENT_NOT_FOUND));

        validateOrganization(currentUser, shipment);

        if (shipment.getStatus() == ShipmentStatus.RECALLED) {
            throw new BusinessException(MSG_SHIPMENT_ALREADY_RECALLED);
        }

        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new BusinessException(MSG_USER_NOT_FOUND));

        Recall recall = new Recall();
        recall.setShipment(shipment);
        recall.setReason(request.getReason());
        recall.setRecalledBy(actor);
        recall.setRecalledAt(LocalDateTime.now());
        recall.setStatus(RecallStatus.ACTIVE);

        recallRepository.save(recall);

        shipment.setStatus(ShipmentStatus.RECALLED);
        shipmentRepository.save(shipment);

        List<TraceCode> traceCodes =
                traceCodeRepository.findByShipmentId(shipmentId);

        traceCodes.forEach(code ->
                code.setStatus(TraceCodeStatus.RECALLED));

        traceCodeRepository.saveAll(traceCodes);

        alertNotificationService.sendShipmentRecallNotification(recall);

        RecallResponse response = new RecallResponse();
        response.setId(recall.getId());
        response.setShipmentId(shipment.getId());
        response.setReason(recall.getReason());
        response.setRecalledBy(actor.getUserId());
        response.setRecalledAt(recall.getRecalledAt());
        response.setStatus(recall.getStatus().name());
        response.setShipmentStatus(shipment.getStatus().name());
        response.setTraceCodesUpdated(traceCodes.size());

        return response;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public RecallInfoResponse getRecallInfo(UUID shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new BusinessException(MSG_SHIPMENT_NOT_FOUND));

        RecallInfoResponse response = new RecallInfoResponse();
        response.setShipmentId(shipmentId);

        recallRepository.findByShipmentId(shipmentId)
                .ifPresentOrElse(recall -> {
                    response.setRecalled(true);
                    response.setReason(recall.getReason());
                    response.setRecalledAt(recall.getRecalledAt());
                }, () -> {
                    response.setRecalled(false);
                    response.setReason(null);
                    response.setRecalledAt(null);
                });

        return response;
    }

    /**
     * Lấy thông tin người dùng hiện tại từ SecurityContext.
     */
    private CustomUserDetails getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return (CustomUserDetails) authentication.getPrincipal();
    }

    /**
     * Kiểm tra người dùng có vai trò VT-02 (Quản lý HTX) hay không.
     */
    private void validateRole(CustomUserDetails currentUser) {

        if (!ORG_MANAGER_ROLE.equals(currentUser.getRoleCode())) {
            throw new BusinessException(MSG_NO_PERMISSION);
        }
    }

    /**
     * Kiểm tra người dùng thuộc tổ chức sở hữu lô hàng.
     */
    private void validateOrganization(
            CustomUserDetails currentUser,
            Shipment shipment) {

        if (!shipment.getOrganization()
                .getOrganizationId()
                .equals(currentUser.getOrganizationId())) {

            throw new BusinessException(MSG_NO_PERMISSION_OTHER_ORG);
        }
    }
}