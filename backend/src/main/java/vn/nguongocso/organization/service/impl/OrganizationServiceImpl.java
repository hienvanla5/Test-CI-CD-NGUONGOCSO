package vn.nguongocso.organization.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.UserStatus;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.organization.constant.RoleCode;
import vn.nguongocso.organization.dto.request.CreateOrganizationRequest;
import vn.nguongocso.organization.dto.request.OrganizationUpdateRequest;
import vn.nguongocso.organization.dto.response.OrganizationProfileResponse;
import vn.nguongocso.organization.dto.response.OrganizationResponse;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.enums.OrganizationStatus;
import vn.nguongocso.organization.enums.OrganizationType;
import vn.nguongocso.organization.enums.OrganizationUserStatus;
import vn.nguongocso.organization.repository.OrganizationRepository;
import vn.nguongocso.organization.repository.OrganizationUserRepository;
import vn.nguongocso.organization.service.OrganizationService;

import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service xử lý nghiệp vụ liên quan đến tổ chức.
 */
@Service
public class OrganizationServiceImpl implements OrganizationService {

    private static final Logger log =
            LoggerFactory.getLogger(OrganizationServiceImpl.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final PasswordEncoder passwordEncoder;

    public OrganizationServiceImpl(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationUserRepository organizationUserRepository,
            PasswordEncoder passwordEncoder) {

        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationUserRepository = organizationUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Lấy danh sách tất cả tổ chức.
     *
     * @return danh sách tổ chức
     */
    @Override
    public List<OrganizationResponse> getAllOrganizations() {

        log.info("Lấy danh sách tất cả organization");

        return organizationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Tạo mới một tổ chức cùng tài khoản quản lý mặc định.
     *
     * @param request thông tin tổ chức và tài khoản quản lý
     * @return thông tin tổ chức sau khi tạo
     */
    @Override
    @Transactional
    public OrganizationResponse createOrganization(
            CreateOrganizationRequest request) {

        log.info(
                "Bắt đầu tạo organization với code={}",
                request.getOrganizationCode()
        );

        validateRequest(request);

        Organization organization =
                createOrganizationEntity(request);

        User manager =
                createManager(request);

        log.debug(
                "Đã tạo Organization id={}",
                organization.getOrganizationId()
        );

        log.debug(
                "Đã tạo User username={}",
                manager.getUserName()
        );

        assignManagerRole(organization, manager);

        log.info(
                "Tạo organization thành công. organizationId={}, manager={}",
                organization.getOrganizationId(),
                manager.getUserName()
        );

        return toResponse(organization);
    }

    private Organization createOrganizationEntity(
            CreateOrganizationRequest request) {

        log.debug(
                "Đang lưu organization {}",
                request.getOrganizationCode()
        );

        Organization organization = new Organization();

        organization.setName(request.getOrganizationName());
        organization.setCode(request.getOrganizationCode());
        organization.setType(request.getOrganizationType());
        organization.setStatus(OrganizationStatus.ACTIVE);
        organization.setAddress(request.getAddress());
        organization.setPhone(request.getPhone());
        organization.setEmail(request.getEmail());

        Organization saved =
                organizationRepository.save(organization);

        log.debug(
                "Đã lưu organization id={}",
                saved.getOrganizationId()
        );

        return saved;
    }

    private User createManager(
            CreateOrganizationRequest request) {

        log.debug(
                "Đang tạo tài khoản quản lý {}",
                request.getUserName()
        );

        User manager = new User();

        manager.setUserName(request.getUserName());
        manager.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        manager.setFullName(request.getFullName());
        manager.setPhone(request.getManagerPhone());
        manager.setEmail(request.getManagerEmail());
        manager.setStatus(UserStatus.ACTIVE);

        User saved =
                userRepository.save(manager);

        log.debug(
                "Đã tạo user id={}",
                saved.getUserId()
        );

        return saved;
    }

    private void assignManagerRole(
            Organization organization,
            User manager) {

        Role role =
                getDefaultRole(organization.getType());

        log.debug(
                "Gán role {} cho user {} trong organization {}",
                role.getCode(),
                manager.getUserName(),
                organization.getCode()
        );

        OrganizationUser link =
                new OrganizationUser();

        link.setOrganization(organization);
        link.setUser(manager);
        link.setRole(role);
        link.setStatus(OrganizationUserStatus.ACTIVE);

        organizationUserRepository.save(link);

        log.debug("Đã lưu OrganizationUser");
    }

    private void validateRequest(
            CreateOrganizationRequest request) {

        if (request.getOrganizationType()
                == OrganizationType.SYSTEM) {

            log.warn(
                    "Yêu cầu tạo SYSTEM organization bị từ chối"
            );

            throw new BusinessException(
                    "Không thể tạo tổ chức System thông qua API này"
            );
        }

        if (organizationRepository.existsByCode(
                request.getOrganizationCode())) {

            log.warn(
                    "Organization code đã tồn tại: {}",
                    request.getOrganizationCode()
            );

            throw new BusinessException(
                    "Organization code đã tồn tại"
            );
        }

        if (userRepository.existsByUserName(
                request.getUserName())) {

            log.warn(
                    "Username đã tồn tại: {}",
                    request.getUserName()
            );

            throw new BusinessException(
                    "Username đã tồn tại"
            );
        }

        if (userRepository.existsByEmail(
                request.getManagerEmail())) {

            log.warn(
                    "Email đã tồn tại: {}",
                    request.getManagerEmail()
            );

            throw new BusinessException(
                    "Email đã tồn tại"
            );
        }
    }

    private String resolveManagerRoleCode(
            OrganizationType type) {

        return switch (type) {
            case SYSTEM -> RoleCode.ADMIN;
            case COOPERATIVE -> RoleCode.ORG_MANAGER;
            case ENTERPRISE -> RoleCode.PROCUREMENT;
            case GOVERNMENT -> RoleCode.REGULATOR;
        };
    }

    private Role getDefaultRole(
            OrganizationType type) {

        String code =
                resolveManagerRoleCode(type);

        log.debug(
                "Tìm role mặc định với code={}",
                code
        );

        return roleRepository.findByCode(code)
                .orElseThrow(() -> {

                    log.error(
                            "Không tìm thấy role mặc định với code={}",
                            code
                    );

                    return new RuntimeException(
                            "Default role not found: " + code
                    );
                });
    }

    private OrganizationResponse toResponse(
            Organization organization) {

        return new OrganizationResponse(
                organization.getOrganizationId(),
                organization.getName(),
                organization.getCode(),
                organization.getType(),
                organization.getStatus(),
                organization.getCreatedAt()
        );
    }

    /**
     * Lấy ID tổ chức của người dùng đang đăng nhập.
     */
    private UUID getCurrentOrganizationId() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new BusinessException("Chưa đăng nhập");
        }

        Object principal =
                auth.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new BusinessException("Lỗi xác thực");
        }

        return userDetails.getOrganizationId();
    }

    /**
     * Lấy thông tin hồ sơ tổ chức hiện tại.
     */
    @Override
    public OrganizationProfileResponse
    getCurrentOrganizationProfile() {

        UUID orgId =
                getCurrentOrganizationId();

        Organization org =
                organizationRepository.findById(orgId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Tổ chức không tồn tại"
                                )
                        );

        return toProfileResponse(org);
    }

    /**
     * Cập nhật tổ chức hiện tại.
     */
    @Override
    @Transactional
    public OrganizationProfileResponse
    updateCurrentOrganization(
            OrganizationUpdateRequest request) {

        UUID orgId =
                getCurrentOrganizationId();

        Organization org =
                organizationRepository.findById(orgId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Tổ chức không tồn tại"
                                )
                        );

        org.setName(request.getName());
        org.setAddress(request.getAddress());
        org.setPhone(request.getPhone());
        org.setEmail(request.getEmail());
        org.setUpdatedAt(LocalDateTime.now());

        organizationRepository.save(org);

        log.info(
                "Cập nhật hồ sơ tổ chức thành công: orgId={}",
                orgId
        );

        return toProfileResponse(org);
    }

    /**
     * Admin cập nhật tổ chức theo ID.
     */
    @Override
    @Transactional
    public OrganizationProfileResponse
    updateOrganizationById(
            UUID orgId,
            OrganizationUpdateRequest request) {

        Organization org =
                organizationRepository.findById(orgId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Tổ chức không tồn tại"
                                )
                        );

        org.setName(request.getName());
        org.setAddress(request.getAddress());
        org.setPhone(request.getPhone());
        org.setEmail(request.getEmail());
        org.setUpdatedAt(LocalDateTime.now());

        organizationRepository.save(org);

        return toProfileResponse(org);
    }

    /**
     * Chuyển Organization sang OrganizationProfileResponse.
     */
    private OrganizationProfileResponse toProfileResponse(
            Organization org) {

        return OrganizationProfileResponse.builder()
                .organizationId(org.getOrganizationId())
                .name(org.getName())
                .code(org.getCode())
                .type(org.getType())
                .status(org.getStatus())
                .address(org.getAddress())
                .phone(org.getPhone())
                .email(org.getEmail())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .build();
    }
}