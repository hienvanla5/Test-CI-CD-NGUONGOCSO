package vn.nguongocso.organization.service;

import vn.nguongocso.organization.dto.request.CreateOrganizationRequest;
import vn.nguongocso.organization.dto.response.OrganizationResponse;

public interface OrganizationService {
	
    OrganizationResponse createOrganization(CreateOrganizationRequest request);
    
}
