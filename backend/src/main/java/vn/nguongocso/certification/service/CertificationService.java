package vn.nguongocso.certification.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.certification.dto.request.AttachCertificationRequest;
<<<<<<< HEAD
import vn.nguongocso.certification.dto.request.CreateCertificationRequest;
=======
>>>>>>> feature/remove-projection-lot
import vn.nguongocso.certification.dto.response.CertificationResponse;
import vn.nguongocso.certification.dto.response.ProductionLotCertificationResponse;

import java.util.List;
import java.util.UUID;

public interface CertificationService {

    List<ProductionLotCertificationResponse> getCertificationsOfLot(UUID lotId, CustomUserDetails currentUser);

    ProductionLotCertificationResponse attachCertification(UUID lotId, AttachCertificationRequest request, CustomUserDetails currentUser);

    void detachCertification(UUID lotId, UUID certificationId, CustomUserDetails currentUser);

    List<CertificationResponse> getValidCertifications(CustomUserDetails currentUser);
<<<<<<< HEAD

    /**
     * Tạo mới chứng nhận cho tổ chức hiện tại.
     */
    CertificationResponse createCertification(CreateCertificationRequest request, CustomUserDetails currentUser);

    /**
     * Lấy tất cả chứng nhận của tổ chức hiện tại.
     */
    List<CertificationResponse> getAllCertifications(CustomUserDetails currentUser);
=======
>>>>>>> feature/remove-projection-lot
}