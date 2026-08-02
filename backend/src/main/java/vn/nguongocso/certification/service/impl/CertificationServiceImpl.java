package vn.nguongocso.certification.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.alert.event.ActivityLogEvent;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.certification.dto.request.AttachCertificationRequest;
<<<<<<< HEAD
import vn.nguongocso.certification.dto.request.CreateCertificationRequest;
=======
>>>>>>> feature/remove-projection-lot
import vn.nguongocso.certification.dto.response.CertificationResponse;
import vn.nguongocso.certification.dto.response.ProductionLotCertificationResponse;
import vn.nguongocso.certification.entity.Certification;
import vn.nguongocso.certification.entity.ProductionLotCertification;
<<<<<<< HEAD
import vn.nguongocso.certification.entity.Standard;
import vn.nguongocso.certification.repository.CertificationRepository;
import vn.nguongocso.certification.repository.ProductionLotCertificationRepository;
import vn.nguongocso.certification.repository.StandardRepository;
=======
import vn.nguongocso.certification.repository.CertificationRepository;
import vn.nguongocso.certification.repository.ProductionLotCertificationRepository;
>>>>>>> feature/remove-projection-lot
import vn.nguongocso.certification.service.CertificationService;
import vn.nguongocso.common.util.IpUtils;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.ResourceNotFoundException;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.repository.ProductionLotRepository;
<<<<<<< HEAD
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.repository.OrganizationRepository;
=======
>>>>>>> feature/remove-projection-lot

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificationServiceImpl implements CertificationService {

    private final ProductionLotRepository productionLotRepository;
    private final CertificationRepository certificationRepository;
    private final ProductionLotCertificationRepository plCertificationRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
<<<<<<< HEAD
    private final StandardRepository standardRepository;
    private final OrganizationRepository organizationRepository;
=======
>>>>>>> feature/remove-projection-lot

    @Override
    @Transactional(readOnly = true)
    public List<ProductionLotCertificationResponse> getCertificationsOfLot(UUID lotId, CustomUserDetails currentUser) {
        ProductionLot lot = findLotAndValidateOrganization(lotId, currentUser);

        List<ProductionLotCertification> list = plCertificationRepository.findByProductionLotId(lotId);
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductionLotCertificationResponse attachCertification(UUID lotId, AttachCertificationRequest request, CustomUserDetails currentUser) {
        // 1. Kiểm tra lô và quyền
        ProductionLot lot = findLotAndValidateOrganization(lotId, currentUser);

        // 2. Kiểm tra chứng nhận tồn tại và thuộc tổ chức
        Certification cert = certificationRepository.findByIdAndOrganizationId(
                request.getCertificationId(),
                currentUser.getOrganizationId()
        ).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chứng nhận hoặc chứng nhận không thuộc tổ chức của bạn."));

        // 3. Kiểm tra hiệu lực (QTN-13)
        if (cert.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Chứng nhận đã hết hạn, không thể gắn cho lô sản xuất.");
        }

        // 4. Kiểm tra trùng lặp
        if (plCertificationRepository.existsByProductionLotIdAndCertificationId(lotId, cert.getId())) {
            throw new BusinessException("Chứng nhận này đã được gắn cho lô sản xuất.");
        }

        // 5. Lưu liên kết
        User actor = userRepository.findById(currentUser.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));

        ProductionLotCertification plc = ProductionLotCertification.builder()
                .productionLot(lot)
                .certification(cert)
                .attachedBy(actor)
                .note(request.getNote())
                .build();
        plc = plCertificationRepository.save(plc);

        // 6. Ghi log (TC-04)
        publishActivityLog(currentUser, "ATTACH_CERTIFICATION",
                "Gắn chứng nhận '" + cert.getName() + "' vào lô sản xuất " + lot.getName(),
                "ProductionLot", lot.getId().toString());

        return toResponse(plc);
    }

    @Override
    @Transactional
    public void detachCertification(UUID lotId, UUID certificationId, CustomUserDetails currentUser) {
        // 1. Kiểm tra lô và quyền
        ProductionLot lot = findLotAndValidateOrganization(lotId, currentUser);

        // 2. Kiểm tra liên kết tồn tại
        ProductionLotCertification plc = plCertificationRepository
                .findByProductionLotIdAndCertificationId(lotId, certificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy liên kết giữa lô và chứng nhận."));

        // 3. Xóa liên kết
        plCertificationRepository.delete(plc);

        // 4. Ghi log
        Certification cert = plc.getCertification();
        publishActivityLog(currentUser, "DETACH_CERTIFICATION",
                "Gỡ chứng nhận '" + cert.getName() + "' khỏi lô sản xuất " + lot.getName(),
                "ProductionLot", lotId.toString());
    }

    @Override
    public List<CertificationResponse> getValidCertifications(CustomUserDetails currentUser) {
        List<Certification> certs = certificationRepository.findByOrganizationIdAndExpiryDateAfter(
                currentUser.getOrganizationId(), LocalDate.now());
        return certs.stream()
                .map(this::toCertificationResponse)
                .collect(Collectors.toList());
    }

<<<<<<< HEAD
    /**
     * Tạo mới chứng nhận cho tổ chức hiện tại.
     */
    @Override
    @Transactional
    public CertificationResponse createCertification(CreateCertificationRequest request, CustomUserDetails currentUser) {
        // 1. Kiểm tra quyền (đã có @PreAuthorize, nhưng vẫn kiểm tra lại)
        if (!"VT-02".equals(currentUser.getRoleCode())) {
            throw new BusinessException("Bạn không có quyền tạo chứng nhận.");
        }

        // 2. Kiểm tra tiêu chuẩn tồn tại
        Standard standard = standardRepository.findById(request.getStandardId())
                .orElseThrow(() -> new ResourceNotFoundException("Tiêu chuẩn không tồn tại."));

        // 3. Kiểm tra số hiệu chứng nhận đã tồn tại
        if (certificationRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessException("Số hiệu chứng nhận đã tồn tại.");
        }

        // 4. Kiểm tra tính hợp lệ của ngày tháng
        if (request.getExpiryDate().isBefore(request.getIssueDate())) {
            throw new BusinessException("Ngày hết hạn phải sau ngày cấp.");
        }
        if (request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Chứng nhận đã hết hạn, không thể tạo mới.");
        }

        Organization organization = organizationRepository.findById(currentUser.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức của người dùng."));

        // 6. Tạo Certification mới
        Certification certification = Certification.builder()
                .id(UUID.randomUUID())
                .organization(organization)
                .name(standard.getName())
                .code(request.getCode())
                .issuedBy(request.getIssuedBy())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .build();

        certification = certificationRepository.save(certification);

        // 7. Ghi log
        publishActivityLog(currentUser, "CREATE_CERTIFICATION",
                "Tạo chứng nhận '" + certification.getCode() + "' cho tiêu chuẩn " + standard.getName(),
                "Certification", certification.getId().toString());

        // 8. Trả về response
        return toCertificationResponse(certification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificationResponse> getAllCertifications(CustomUserDetails currentUser) {
        List<Certification> certs = certificationRepository.findAllByOrganizationId(
                currentUser.getOrganizationId()
        );
        return certs.stream()
                .map(this::toCertificationResponse)
                .collect(Collectors.toList());
    }

=======
>>>>>>> feature/remove-projection-lot
    private CertificationResponse toCertificationResponse(Certification cert) {
        return CertificationResponse.builder()
                .id(cert.getId())
                .name(cert.getName())
                .code(cert.getCode())
                .issuedBy(cert.getIssuedBy())
                .issueDate(cert.getIssueDate())
                .expiryDate(cert.getExpiryDate())
                .isValid(!cert.getExpiryDate().isBefore(LocalDate.now()))
                .build();
    }

    // --- Helper methods ---

    private ProductionLot findLotAndValidateOrganization(UUID lotId, CustomUserDetails currentUser) {
        ProductionLot lot = productionLotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lô sản xuất."));
        if (!lot.getOrganization().getOrganizationId().equals(currentUser.getOrganizationId())) {
            throw new BusinessException("Bạn không có quyền thao tác trên lô sản xuất này.");
        }
        return lot;
    }

    private ProductionLotCertificationResponse toResponse(ProductionLotCertification plc) {
        Certification cert = plc.getCertification();
        return ProductionLotCertificationResponse.builder()
                .id(plc.getId())
                .certificationId(cert.getId())
                .certificationName(cert.getName())
                .certificationCode(cert.getCode())
                .issuedBy(cert.getIssuedBy())
                .issueDate(cert.getIssueDate())
                .expiryDate(cert.getExpiryDate())
                .isValid(!cert.getExpiryDate().isBefore(LocalDate.now()))
                .attachedAt(plc.getAttachedAt())
                .attachedBy(plc.getAttachedBy().getFullName())
                .note(plc.getNote())
                .build();
    }

    private void publishActivityLog(CustomUserDetails currentUser, String action, String description,
                                    String entityType, String entityId) {
        eventPublisher.publishEvent(ActivityLogEvent.builder()
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .fullName(currentUser.getFullName())
                .organizationId(currentUser.getOrganizationId())
                .action(action)
                .description(description)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(IpUtils.getClientIp())
                .timestamp(java.time.LocalDateTime.now())
                .build()
        );
    }
}