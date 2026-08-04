package vn.nguongocso.organization.service;

import vn.nguongocso.auth.dto.request.AddMemberRequest;
import vn.nguongocso.organization.dto.request.CreateOrganizationRequest;
import vn.nguongocso.organization.dto.request.OrganizationUpdateRequest;
import vn.nguongocso.organization.dto.response.CreateOrganizationMemberResponse;
import vn.nguongocso.organization.dto.response.OrganizationDetailResponse;
import vn.nguongocso.organization.dto.response.OrganizationProfileResponse;
import vn.nguongocso.organization.dto.response.OrganizationResponse;

import java.util.List;
import java.util.UUID;

public interface OrganizationService {

    OrganizationResponse createOrganization(CreateOrganizationRequest request);

    OrganizationProfileResponse getCurrentOrganizationProfile();

    OrganizationProfileResponse updateCurrentOrganization(OrganizationUpdateRequest request);

    OrganizationProfileResponse updateOrganizationById(UUID orgId, OrganizationUpdateRequest request);

    List<OrganizationResponse> getAllOrganizations();

    OrganizationDetailResponse getOrganizationDetail(UUID organizationId);

    CreateOrganizationMemberResponse addMember(
            UUID organizationId,
            AddMemberRequest request);
}
