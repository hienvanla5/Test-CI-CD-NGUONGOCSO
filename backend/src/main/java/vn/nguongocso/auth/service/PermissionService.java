package vn.nguongocso.auth.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.nguongocso.auth.dto.request.AddMemberRequest;
import vn.nguongocso.auth.dto.request.AssignRoleRequest;
import vn.nguongocso.auth.dto.response.OrganizationUserResponse;
import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.enums.UserStatus;
import vn.nguongocso.auth.repository.RoleRepository;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.ResourceNotFoundException;
import vn.nguongocso.organization.constant.RoleCode;
import vn.nguongocso.organization.entity.Organization;
import vn.nguongocso.organization.entity.OrganizationUser;
import vn.nguongocso.organization.enums.OrganizationUserStatus;
import vn.nguongocso.organization.repository.OrganizationRepository;
import vn.nguongocso.organization.repository.OrganizationUserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final OrganizationUserRepository orgUserRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    // helper
    private UUID getCurrentOrganizationId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BusinessException("Chưa đăng nhập");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getOrganizationId();
    }

    private String getCurrentRoleCode() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userDetails.getRoleCode();
    }

    private Organization getCurrentOrganization() {
        UUID orgId = getCurrentOrganizationId();
        return organizationRepository.findById(orgId)
                .orElseThrow(() -> new BusinessException("Tổ chức không tồn tại"));
    }

    // business methods
    public List<OrganizationUserResponse> getMembersOfCurrentOrganization() {
        UUID orgId = getCurrentOrganizationId();
        List<OrganizationUser> orgUsers = orgUserRepository
                .findByOrganization_OrganizationIdAndStatus(orgId, OrganizationUserStatus.ACTIVE);
        return orgUsers.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gán vai trò mới cho một thành viên trong tổ chức hiện tại
     */
    @Transactional
    public OrganizationUserResponse assignRole(AssignRoleRequest request) {
        UUID orgId = getCurrentOrganizationId();
        String currentRoleCode = getCurrentRoleCode();

        OrganizationUser orgUser = orgUserRepository
                .findByOrganization_OrganizationIdAndUser_UserId(orgId, request.getUserId())
                .orElseThrow(() -> new BusinessException("Thành viên không thuộc tổ chức này"));

        Role newRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò không tồn tại"));

        if (RoleCode.ADMIN.equals(newRole.getCode()) && !RoleCode.ADMIN.equals(currentRoleCode)) {
            throw new BusinessException("Quản lý HTX không thể gán vai trò Quản trị viên nền tảng");
        }

        // 🆕 Nếu role mới là VT-02, kiểm tra và chuyển quyền quản lý cũ
        if (RoleCode.ORG_MANAGER.equals(newRole.getCode())) {
            // Tìm thành viên đang giữ VT-02 trong cùng tổ chức, ngoại trừ chính người được cập nhật
            OrganizationUser currentManager = orgUserRepository
                    .findByOrganization_OrganizationIdAndRole_Code(orgId, RoleCode.ORG_MANAGER)
                    .filter(m -> !m.getUser().getUserId().equals(request.getUserId()))
                    .orElse(null);

            if (currentManager != null) {
                Role vt03Role = roleRepository.findByCode(RoleCode.EVENT_RECORDER)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role VT-03"));

                // Hạ quản lý cũ xuống VT-03
                currentManager.setRole(vt03Role);
                orgUserRepository.save(currentManager);
                log.info("Hạ quản lý cũ {} xuống VT-03", currentManager.getUser().getFullName());
            }
        }

        // Gán role mới cho thành viên được chọn
        orgUser.setRole(newRole);
        orgUser = orgUserRepository.save(orgUser);

        log.info("Gán role thành công: userId={}, orgId={}, newRole={}", request.getUserId(), orgId, newRole.getCode());
        return toResponse(orgUser);
    }

    /**
     * Thêm thành viên mới vào tổ chức hiện tại
     */
    @Transactional
    public OrganizationUserResponse addMember(AddMemberRequest request) {
        UUID orgId = getCurrentOrganizationId();
        Organization org = getCurrentOrganization();

        if (userRepository.findByUserName(request.getUsername()).isPresent()) {
            throw new BusinessException("Tên đăng nhập đã tồn tại");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vai trò không tồn tại"));

        String currentRoleCode = getCurrentRoleCode();
        if (RoleCode.ADMIN.equals(role.getCode()) && !RoleCode.ADMIN.equals(currentRoleCode)) {
            throw new BusinessException("Quản lý HTX không thể tạo tài khoản admin");
        }

        User newUser = new User();
        newUser.setUserId(UUID.randomUUID());
        newUser.setUserName(request.getUsername());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setFullName(request.getFullName());
        newUser.setPhone(request.getPhone());
        newUser.setEmail(request.getEmail());
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(newUser);

        OrganizationUser orgUser = new OrganizationUser();
        orgUser.setId(UUID.randomUUID());
        orgUser.setOrganization(org);
        orgUser.setUser(newUser);
        orgUser.setRole(role);
        orgUser.setJoinedAt(LocalDateTime.now());
        orgUser.setStatus(OrganizationUserStatus.ACTIVE);
        orgUserRepository.save(orgUser);

        log.info("Thêm thành viên thành công: userId={}, orgId={}, role={}",
            newUser.getUserId(), orgId, role.getCode());

        return toResponse(orgUser);
    }

    // mapping
    private OrganizationUserResponse toResponse(OrganizationUser orgUser) {
        User user = orgUser.getUser();
        Role role = orgUser.getRole();

        return OrganizationUserResponse.builder()
                .id(orgUser.getId())
                .organizationId(orgUser.getOrganization().getOrganizationId())
                .userId(user.getUserId())
                .username(user.getUserName())
                .fullName(user.getFullName())
                .roleId(role.getRoleId())
                .roleCode(role.getCode())
                .roleName(role.getName())
                .customPermissions(orgUser.getCustomPermissions())
                .status(orgUser.getStatus())
                .status(orgUser.getStatus())
                .joinedAt(orgUser.getJoinedAt())
                .build();
    }
}
