package vn.nguongocso.report.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.report.dto.response.CropAreaAnalysisResponse;
import vn.nguongocso.report.service.CropAreaAnalysisService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports/crop-area-analysis")
@RequiredArgsConstructor
public class CropAreaAnalysisController {

    private final CropAreaAnalysisService cropAreaAnalysisService;

    @GetMapping
    @PreAuthorize("hasAnyRole('VT-01', 'VT-05')")
    public ResponseEntity<ApiResult<CropAreaAnalysisResponse>> getAnalysis(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) UUID farmAreaId,
            @RequestParam(required = false) UUID productCategoryId,
            @RequestParam(required = false) UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            HttpServletRequest request) {

        String ipAddress = getClientIp(request);
        CropAreaAnalysisResponse response = cropAreaAnalysisService.getAnalysis(
                year, farmAreaId, productCategoryId, organizationId, currentUser, ipAddress);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
