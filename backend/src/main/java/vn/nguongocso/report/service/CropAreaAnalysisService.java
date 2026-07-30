package vn.nguongocso.report.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.report.dto.response.CropAreaAnalysisResponse;
import java.util.UUID;

public interface CropAreaAnalysisService {
    CropAreaAnalysisResponse getAnalysis(
            Integer year,
            UUID farmAreaId,
            UUID productCategoryId,
            UUID organizationId,
            CustomUserDetails currentUser,
            String ipAddress);
}
