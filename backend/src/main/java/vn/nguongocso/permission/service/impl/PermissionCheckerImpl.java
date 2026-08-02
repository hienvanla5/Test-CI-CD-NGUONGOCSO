package vn.nguongocso.permission.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.entity.Permission;
import vn.nguongocso.auth.entity.Role;
import vn.nguongocso.auth.security.SecurityUtils;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.permission.entity.OrganizationRolePermission;
import vn.nguongocso.permission.entity.RolePermission;
import vn.nguongocso.permission.repository.OrganizationRolePermissionRepository;
import vn.nguongocso.permission.repository.PermissionRepository;
import vn.nguongocso.permission.repository.RolePermissionRepository;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.auth.repository.RoleRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionCheckerImpl implements PermissionChecker {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final OrganizationRolePermissionRepository organizationRolePermissionRepository;

    @Override
    public void check(String resource, String action) {

        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();

        Permission permission = permissionRepository
                .findByResourceAndAction(resource, action)
                .orElseThrow(() ->
                        new BusinessException("Permission không tồn tại."));

        Role role = roleRepository.findByCode(currentUser.getRoleCode())
                .orElseThrow(() ->
                        new BusinessException("Vai trò không tồn tại."));

                            // ===== DEBUG =====
    System.out.println("===== PermissionChecker =====");
    System.out.println("resource = " + resource);
    System.out.println("action = " + action);
    System.out.println("permissionId = " + permission.getPermissionId());
    System.out.println("roleCode = " + currentUser.getRoleCode());
    System.out.println("roleId = " + role.getRoleId());
    System.out.println("organizationId = " + currentUser.getOrganizationId());
    // =================
        Optional<OrganizationRolePermission> organizationPermission =
                organizationRolePermissionRepository
                        .findByOrganization_OrganizationIdAndRole_RoleIdAndPermission_PermissionId(
                                currentUser.getOrganizationId(),
                                role.getRoleId(),
                                permission.getPermissionId());

        boolean enabled;

        if (organizationPermission.isPresent()) {

            enabled = Boolean.TRUE.equals(
                    organizationPermission.get().getEnabled());

        } else {

            RolePermission defaultPermission =
                    rolePermissionRepository
                            .findByRole_RoleIdAndPermission_PermissionId(
                                    role.getRoleId(),
                                    permission.getPermissionId())
                            .orElseThrow(() ->
                                    new BusinessException(
                                            "Permission mặc định chưa được cấu hình."));

            enabled = Boolean.TRUE.equals(defaultPermission.getEnabled());
        }

        if (!enabled) {
            throw new BusinessException(
                    "Bạn không có quyền thực hiện chức năng này.");
        }
    }
}