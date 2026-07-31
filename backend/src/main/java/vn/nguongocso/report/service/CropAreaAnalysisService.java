package vn.nguongocso.report.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.report.dto.response.CropAreaAnalysisResponse;

import java.util.UUID;

/**
 * Service phân tích diện tích canh tác.
 *
 * @author Triệu Văn Đại
 */
public interface CropAreaAnalysisService {

    /**
     * Lấy báo cáo phân tích diện tích canh tác.
     */
    CropAreaAnalysisResponse getAnalysis(
            Integer year,
            UUID farmAreaId,
            UUID productCategoryId,
            UUID organizationId,
            CustomUserDetails currentUser,
            String ipAddress);
}