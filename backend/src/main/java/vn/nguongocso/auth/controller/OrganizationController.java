package vn.nguongocso.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
=======
import org.springframework.web.bind.annotation.*;
>>>>>>> 726c1b031c37a9725c2f1a2664ebb4e81c2a0555

import jakarta.validation.Valid;
import vn.nguongocso.auth.dto.request.CreateOrganizationRequest;
import vn.nguongocso.auth.dto.response.OrganizationResponse;
import vn.nguongocso.auth.service.OrganizationService;
import vn.nguongocso.common.ApiResult;

/**
 * REST Controller cung cấp các API quản lý tổ chức.
 *
 * <p>Hiện tại hỗ trợ tạo mới tổ chức cùng tài khoản quản lý mặc định.</p>
 */
@RestController
@RequestMapping("/api/v1/admin/organizations")
public class OrganizationController {

<<<<<<< HEAD
	private final OrganizationService organizationService;
	
	public OrganizationController(OrganizationService organizationService) {
		this.organizationService = organizationService;
	}
	
	@PostMapping
	@PreAuthorize("hasRole('VT-01')")
	public ResponseEntity<ApiResult<OrganizationResponse>> create(
			@Valid @RequestBody CreateOrganizationRequest request){
		OrganizationResponse response = organizationService.createOrganization(request);
		return ResponseEntity.ok(ApiResult.success(response));
	}
}
=======
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
}
>>>>>>> 726c1b031c37a9725c2f1a2664ebb4e81c2a0555
