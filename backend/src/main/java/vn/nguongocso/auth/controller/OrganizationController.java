package vn.nguongocso.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.nguongocso.auth.dto.request.CreateOrganizationRequest;
import vn.nguongocso.auth.dto.response.OrganizationResponse;
import vn.nguongocso.auth.service.OrganizationService;
import vn.nguongocso.common.ApiResult;

@RestController
@RequestMapping("/api/v1/admin/organizations")
public class OrganizationController {

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
