package vn.nguongocso.auth.service;

import vn.nguongocso.auth.dto.request.CreateOrganizationRequest;
import vn.nguongocso.auth.dto.response.OrganizationResponse;

public interface OrganizationService {
	
    OrganizationResponse createOrganization(CreateOrganizationRequest request);
    
}
