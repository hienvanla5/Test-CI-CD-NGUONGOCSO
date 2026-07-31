package vn.nguongocso.report.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.report.dto.response.DossierCheckResponse;

import java.util.UUID;

public interface DossierService {
    DossierCheckResponse checkEligibility(UUID shipmentId, CustomUserDetails currentUser);
    byte[] exportDossierPdf(UUID shipmentId, CustomUserDetails currentUser, String ipAddress);
}
