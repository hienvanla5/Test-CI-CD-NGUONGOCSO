package vn.nguongocso.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.auth.dto.request.AddMemberRequest;
import vn.nguongocso.auth.dto.request.AssignRoleRequest;
import vn.nguongocso.auth.dto.response.OrganizationUserResponse;
import vn.nguongocso.auth.service.PermissionService;
import vn.nguongocso.common.ApiResult;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organization/members")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('VT-01', 'VT-02')")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<ApiResult<List<OrganizationUserResponse>>> getMembers() {

        return ResponseEntity.ok(ApiResult.success(
                permissionService.getMembersOfCurrentOrganization()
        ));
    }

    @PutMapping("/roles")
    public ResponseEntity<ApiResult<OrganizationUserResponse>> assignRole(
            @Valid @RequestBody AssignRoleRequest request) {


        return ResponseEntity.ok(ApiResult.success(
                permissionService.assignRole(request)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResult<OrganizationUserResponse>> addMember(
            @Valid @RequestBody AddMemberRequest request
    ) {

        return ResponseEntity.ok(ApiResult.success(
                permissionService.addMember(request)
        ));
    }
}
