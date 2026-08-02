package vn.nguongocso.organization.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.organization.dto.request.CreateOrganizationRequest;
import vn.nguongocso.organization.dto.request.OrganizationUpdateRequest;
import vn.nguongocso.organization.dto.response.OrganizationProfileResponse;
import vn.nguongocso.organization.dto.response.OrganizationResponse;
import vn.nguongocso.organization.service.OrganizationService;
import vn.nguongocso.permission.service.PermissionChecker;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller cung cấp các API quản lý tổ chức.
 */
@RestController
@RequestMapping("/api/v1/admin/organizations")
public class OrganizationController {

    private static final Logger log =
            LoggerFactory.getLogger(
                    OrganizationController.class
            );

    private final OrganizationService
            organizationService;
    private final PermissionChecker permissionChecker;

    /**
     * Khởi tạo controller quản lý tổ chức.
     *
     * @param organizationService service xử lý nghiệp vụ tổ chức
     * @param permissionChecker   service kiểm tra phân quyền chi tiết
     */
    public OrganizationController(
            OrganizationService organizationService,
            PermissionChecker permissionChecker
    ) {
        this.organizationService =
                organizationService;
        this.permissionChecker = permissionChecker;
    }

    /**
     * Lấy toàn bộ danh sách tổ chức.
     *
     * Chỉ tài khoản VT-01 được phép truy cập.
     *
     * @return danh sách tổ chức
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('VT-01')")
    public ResponseEntity<
            ApiResult<List<OrganizationResponse>>
            > getAllOrganizations() {

        permissionChecker.check("ORGANIZATION", "READ");

        log.info(
                "Nhận yêu cầu lấy danh sách organization"
        );

        List<OrganizationResponse> organizations =
                organizationService
                        .getAllOrganizations();

        log.info(
                "Lấy danh sách organization thành công, số lượng={}",
                organizations.size()
        );

        return ResponseEntity.ok(
                ApiResult.success(
                        organizations
                )
        );
    }

    /**
     * Tạo mới một tổ chức cùng tài khoản quản lý mặc định.
     *
     * @param request thông tin tổ chức và tài khoản quản lý
     * @return thông tin tổ chức sau khi tạo thành công
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('VT-01')")
    public ResponseEntity<
            ApiResult<OrganizationResponse>
            > create(
            @Valid
            @RequestBody
            CreateOrganizationRequest request
    ) {

        permissionChecker.check("ORGANIZATION", "CREATE");

        log.info(
                "Nhận yêu cầu tạo organization với code={}",
                request.getOrganizationCode()
        );

        OrganizationResponse response =
                organizationService
                        .createOrganization(
                                request
                        );

        log.info(
                "Tạo organization thành công với id={}",
                response.getOrganizationID()
        );

        return ResponseEntity.ok(
                ApiResult.success(
                        response
                )
        );
    }

    /**
     * Admin cập nhật hồ sơ một tổ chức theo ID.
     *
     * @param id ID tổ chức
     * @param request dữ liệu cập nhật
     * @return hồ sơ tổ chức sau khi cập nhật
     */
    @PutMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('VT-01')")
    public ResponseEntity<
            ApiResult<OrganizationProfileResponse>
            > updateProfileByAdmin(
            @PathVariable UUID id,
            @Valid
            @RequestBody
            OrganizationUpdateRequest request
    ) {

        permissionChecker.check("ORGANIZATION", "UPDATE");

        log.info(
                "Admin cập nhật hồ sơ organization id={}",
                id
        );

        OrganizationProfileResponse response =
                organizationService
                        .updateOrganizationById(
                                id,
                                request
                        );

        return ResponseEntity.ok(
                ApiResult.success(
                        response
                )
        );
    }

}