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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service xử lý nghiệp vụ liên quan đến tổ chức.
 */
@Service
public class OrganizationServiceImpl
        implements OrganizationService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    OrganizationServiceImpl.class
            );

    private final OrganizationRepository
            organizationRepository;

    private final UserRepository
            userRepository;

    private final RoleRepository
            roleRepository;

    private final OrganizationUserRepository
            organizationUserRepository;

    private final PasswordEncoder
            passwordEncoder;

    public OrganizationServiceImpl(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationUserRepository organizationUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.organizationRepository =
                organizationRepository;

        this.userRepository =
                userRepository;

        this.roleRepository =
                roleRepository;

        this.organizationUserRepository =
                organizationUserRepository;

        this.passwordEncoder =
                passwordEncoder;
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
            CreateOrganizationRequest request
    ) {
        log.info(
                "Bắt đầu tạo organization với code={}",
                request.getOrganizationCode()
        );

        validateRequest(request);

        Organization organization =
                createOrganizationEntity(
                        request
                );

        User manager =
                createManager(
                        request
                );

        log.debug(
                "Đã tạo Organization id={}",
                organization.getOrganizationId()
        );

        log.debug(
                "Đã tạo User username={}",
                manager.getUserName()
        );

        assignManagerRole(
                organization,
                manager
        );

        log.info(
                "Tạo organization thành công. organizationId={}, manager={}",
                organization.getOrganizationId(),
                manager.getUserName()
        );

        return toResponse(
                organization
        );
    }

    /**
     * Lấy toàn bộ danh sách tổ chức.
     *
     * @return danh sách tổ chức
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse>
    getAllOrganizations() {

        log.info(
                "Bắt đầu lấy danh sách organization"
        );

        List<OrganizationResponse>
                organizations =
                organizationRepository
                        .findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Lấy danh sách organization thành công, số lượng={}",
                organizations.size()
        );

        return organizations;
    }

    private Organization createOrganizationEntity(
            CreateOrganizationRequest request
    ) {
        log.debug(
                "Đang lưu organization {}",
                request.getOrganizationCode()
        );

        Organization organization =
                new Organization();

        organization.setName(
                request.getOrganizationName()
        );

        organization.setCode(
                request.getOrganizationCode()
        );

        organization.setType(
                request.getOrganizationType()
        );

        organization.setStatus(
                OrganizationStatus.ACTIVE
        );

        organization.setAddress(
                request.getAddress()
        );

        organization.setPhone(
                request.getPhone()
        );

        organization.setEmail(
                request.getEmail()
        );

        Organization saved =
                organizationRepository.save(
                        organization
                );

        log.debug(
                "Đã lưu organization id={}",
                saved.getOrganizationId()
        );

        return saved;
    }

    private User createManager(
            CreateOrganizationRequest request
    ) {
        log.debug(
                "Đang tạo tài khoản quản lý {}",
                request.getUserName()
        );

        User manager =
                new User();

        manager.setUserName(
                request.getUserName()
        );

        manager.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        manager.setFullName(
                request.getFullName()
        );

        manager.setPhone(
                request.getManagerPhone()
        );

        manager.setEmail(
                request.getManagerEmail()
        );

        manager.setStatus(
                UserStatus.ACTIVE
        );

        User saved =
                userRepository.save(
                        manager
                );

        log.debug(
                "Đã tạo user id={}",
                saved.getUserId()
        );

        return saved;
    }

    private void assignManagerRole(
            Organization organization,
            User manager
    ) {
        Role role =
                getDefaultRole(
                        organization.getType()
                );

        log.debug(
                "Gán role {} cho user {} trong organization {}",
                role.getCode(),
                manager.getUserName(),
                organization.getCode()
        );

        OrganizationUser link =
                new OrganizationUser();

        link.setOrganization(
                organization
        );

        link.setUser(
                manager
        );

        link.setRole(
                role
        );

        link.setStatus(
                OrganizationUserStatus.ACTIVE
        );

        organizationUserRepository.save(
                link
        );

        log.debug(
                "Đã lưu OrganizationUser"
        );
    }

    private void validateRequest(
            CreateOrganizationRequest request
    ) {
        if (
                request.getOrganizationType()
                        == OrganizationType.SYSTEM
        ) {
            log.warn(
                    "Yêu cầu tạo SYSTEM organization bị từ chối"
            );

            throw new BusinessException(
                    "Không thể tạo tổ chức System thông qua API này"
            );
        }

        if (
                organizationRepository.existsByCode(
                        request.getOrganizationCode()
                )
        ) {
            log.warn(
                    "Organization code đã tồn tại: {}",
                    request.getOrganizationCode()
            );

            throw new BusinessException(
                    "Organization code đã tồn tại"
            );
        }

        if (
                userRepository.existsByUserName(
                        request.getUserName()
                )
        ) {
            log.warn(
                    "Username đã tồn tại: {}",
                    request.getUserName()
            );

            throw new BusinessException(
                    "Username đã tồn tại"
            );
        }

        if (
                userRepository.existsByEmail(
                        request.getManagerEmail()
                )
        ) {
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
            OrganizationType type
    ) {
        return switch (type) {
            case SYSTEM ->
                    RoleCode.ADMIN;

            case COOPERATIVE ->
                    RoleCode.ORG_MANAGER;

            case ENTERPRISE ->
                    RoleCode.PROCUREMENT;

            case GOVERNMENT ->
                    RoleCode.REGULATOR;
        };
    }

    private Role getDefaultRole(
            OrganizationType type
    ) {
        String code =
                resolveManagerRoleCode(
                        type
                );

        log.debug(
                "Tìm role mặc định với code={}",
                code
        );

        return roleRepository
                .findByCode(code)
                .orElseThrow(
                        () -> {
                            log.error(
                                    "Không tìm thấy role mặc định với code={}",
                                    code
                            );

                            return new RuntimeException(
                                    "Default role not found: "
                                            + code
                            );
                        }
                );
    }

    private OrganizationResponse toResponse(
            Organization organization
    ) {
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
     * Lấy organizationId của người dùng hiện tại.
     *
     * @return organizationId hiện tại
     */
    private UUID getCurrentOrganizationId() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        || !authentication
                        .isAuthenticated()
        ) {
            throw new BusinessException(
                    "Chưa đăng nhập"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (
                !(principal instanceof
                        CustomUserDetails userDetails)
        ) {
            throw new BusinessException(
                    "Lỗi xác thực"
            );
        }

        return userDetails.getOrganizationId();
    }

    /**
     * Lấy thông tin hồ sơ tổ chức hiện tại.
     *
     * @return thông tin hồ sơ tổ chức
     */
    @Override
    @Transactional(readOnly = true)
    public OrganizationProfileResponse
    getCurrentOrganizationProfile() {

        UUID organizationId =
                getCurrentOrganizationId();

        Organization organization =
                organizationRepository
                        .findById(
                                organizationId
                        )
                        .orElseThrow(
                                () ->
                                        new BusinessException(
                                                "Tổ chức không tồn tại"
                                        )
                        );

        return toProfileResponse(
                organization
        );
    }

    /**
     * Cập nhật hồ sơ tổ chức hiện tại.
     *
     * @param request dữ liệu cập nhật
     * @return hồ sơ sau khi cập nhật
     */
    @Override
    @Transactional
    public OrganizationProfileResponse
    updateCurrentOrganization(
            OrganizationUpdateRequest request
    ) {
        UUID organizationId =
                getCurrentOrganizationId();

        Organization organization =
                organizationRepository
                        .findById(
                                organizationId
                        )
                        .orElseThrow(
                                () ->
                                        new BusinessException(
                                                "Tổ chức không tồn tại"
                                        )
                        );

        organization.setName(
                request.getName()
        );

        organization.setAddress(
                request.getAddress()
        );

        organization.setPhone(
                request.getPhone()
        );

        organization.setEmail(
                request.getEmail()
        );

        organization.setUpdatedAt(
                LocalDateTime.now()
        );

        organizationRepository.save(
                organization
        );

        log.info(
                "Cập nhật hồ sơ tổ chức thành công: orgId={}",
                organizationId
        );

        return toProfileResponse(
                organization
        );
    }

    /**
     * Admin cập nhật một tổ chức theo ID.
     *
     * @param orgId ID tổ chức
     * @param request dữ liệu cập nhật
     * @return hồ sơ sau khi cập nhật
     */
    @Override
    @Transactional
    public OrganizationProfileResponse
    updateOrganizationById(
            UUID orgId,
            OrganizationUpdateRequest request
    ) {
        Organization organization =
                organizationRepository
                        .findById(
                                orgId
                        )
                        .orElseThrow(
                                () ->
                                        new BusinessException(
                                                "Tổ chức không tồn tại"
                                        )
                        );

        organization.setName(
                request.getName()
        );

        organization.setAddress(
                request.getAddress()
        );

        organization.setPhone(
                request.getPhone()
        );

        organization.setEmail(
                request.getEmail()
        );

        organization.setUpdatedAt(
                LocalDateTime.now()
        );

        organizationRepository.save(
                organization
        );

        return toProfileResponse(
                organization
        );
    }

    /**
     * Chuyển entity Organization sang OrganizationProfileResponse.
     *
     * @param organization entity tổ chức
     * @return response hồ sơ tổ chức
     */
    private OrganizationProfileResponse
    toProfileResponse(
            Organization organization
    ) {
        return OrganizationProfileResponse
                .builder()
                .organizationId(
                        organization
                                .getOrganizationId()
                )
                .name(
                        organization.getName()
                )
                .code(
                        organization.getCode()
                )
                .type(
                        organization.getType()
                )
                .status(
                        organization.getStatus()
                )
                .address(
                        organization.getAddress()
                )
                .phone(
                        organization.getPhone()
                )
                .email(
                        organization.getEmail()
                )
                .createdAt(
                        organization.getCreatedAt()
                )
                .updatedAt(
                        organization.getUpdatedAt()
                )
                .build();
    }
}