package vn.nguongocso.permission.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import vn.nguongocso.common.ApiResult;
import vn.nguongocso.permission.dto.request.UpdateRolePermissionRequest;
import vn.nguongocso.permission.dto.response.RolePermissionGroupResponse;
import vn.nguongocso.permission.dto.response.RolePermissionResponse;
import vn.nguongocso.permission.service.OrganizationRolePermissionService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class OrganizationRolePermissionController {

    private final OrganizationRolePermissionService organizationRolePermissionService;

    /**
     * Danh sách toàn bộ permission của hệ thống.
     */
    @GetMapping("/permissions")
    public ApiResult<List<RolePermissionGroupResponse>> getSystemPermissions() {

        return ApiResult.success(
                organizationRolePermissionService.getSystemPermissions()
        );
    }

    /**
     * Lấy cấu hình quyền của một vai trò trong tổ chức.
     */
    @GetMapping("/organizations/{organizationId}/roles/{roleId}/permissions")
    public ApiResult<RolePermissionResponse> getRolePermissions(
            @PathVariable UUID organizationId,
            @PathVariable Integer roleId) {

        return ApiResult.success(
                organizationRolePermissionService.getRolePermissions(
                        organizationId,
                        roleId)
        );
    }

    /**
     * Cập nhật quyền của một vai trò trong tổ chức.
     */
    @PutMapping("/organizations/{organizationId}/roles/{roleId}/permissions")
    public ApiResult<RolePermissionResponse> updateRolePermissions(
            @PathVariable UUID organizationId,
            @PathVariable Integer roleId,
            @Valid @RequestBody UpdateRolePermissionRequest request) {

        return ApiResult.success(
                organizationRolePermissionService.updateRolePermissions(
                        organizationId,
                        roleId,
                        request)
        );
    }
}