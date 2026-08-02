package vn.nguongocso.organization.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.organization.dto.request.CreateInvitationRequest;
import vn.nguongocso.organization.dto.request.AcceptInvitationRequest;
import vn.nguongocso.organization.dto.response.InvitationResponse;
import vn.nguongocso.organization.dto.response.InvitationPublicResponse;
import vn.nguongocso.organization.dto.response.AcceptInvitationResponse;

public interface InvitationService {

    InvitationResponse createInvitation(CreateInvitationRequest request, CustomUserDetails currentUser);

    InvitationPublicResponse getInvitationDetails(String token);

    AcceptInvitationResponse acceptInvitation(String token, AcceptInvitationRequest request);
}
