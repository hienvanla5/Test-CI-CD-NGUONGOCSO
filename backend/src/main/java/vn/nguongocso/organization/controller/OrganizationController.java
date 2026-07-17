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

import java.util.UUID;

/**
 * REST Controller cung cấp các API quản lý tổ chức.
 *
 * <p>Hiện tại hỗ trợ tạo mới tổ chức cùng tài khoản quản lý mặc định.</p>
 */
@RestController
@RequestMapping("/api/v1/admin/organizations")
public class OrganizationController {

    private static final Logger log =
            LoggerFactory.getLogger(OrganizationController.class);

    private final OrganizationService organizationService;

    /**
     * Khởi tạo controller quản lý tổ chức.
     *
     * @param organizationService service xử lý nghiệp vụ tổ chức
     */
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    /**
     * Tạo mới một tổ chức cùng tài khoản quản lý mặc định.
     *
     * @param request thông tin tổ chức và tài khoản quản lý
     * @return thông tin tổ chức sau khi tạo thành công
     */
    @PostMapping
    public ResponseEntity<ApiResult<OrganizationResponse>> create(
            @Valid @RequestBody CreateOrganizationRequest request) {

        log.info(
                "Nhận yêu cầu tạo organization với code={}",
                request.getOrganizationCode()
        );

        OrganizationResponse response = organizationService.createOrganization(request);

        log.info(
                "Tạo organization thành công với id={}",
                response.getOrganizationID()
        );

        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PutMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('VT-01')")
    public ResponseEntity<ApiResult<OrganizationProfileResponse>> updateProfileByAdmin(
            @PathVariable UUID id,
            @Valid @RequestBody OrganizationUpdateRequest request) {
        log.info("Cập nhật hồ sơ tổ chức hiện tại");
        return ResponseEntity.ok(ApiResult.success(organizationService.updateOrganizationById(id, request)));
    }
}