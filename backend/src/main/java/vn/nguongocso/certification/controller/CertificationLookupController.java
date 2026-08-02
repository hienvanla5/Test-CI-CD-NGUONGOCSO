package vn.nguongocso.certification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.certification.dto.response.CertificationResponse;
import vn.nguongocso.certification.service.CertificationService;
import vn.nguongocso.common.ApiResult;

import java.util.List;

@RestController
@RequestMapping("/api/v1/certifications")
@RequiredArgsConstructor
public class CertificationLookupController {

    private final CertificationService certificationService;

    @GetMapping("/valid")
    @PreAuthorize("hasRole('VT-02')")
    public ResponseEntity<ApiResult<List<CertificationResponse>>> getValidCertifications(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        List<CertificationResponse> certifications = certificationService.getValidCertifications(currentUser);
        return ResponseEntity.ok(ApiResult.success(certifications));
    }

    @PostMapping("/check-expiry")
    @PreAuthorize("hasRole('VT-01')")
    public ResponseEntity<ApiResult<Void>> checkCertificationExpiry() {
        certificationService.checkCertificationExpiry();
        return ResponseEntity.ok(ApiResult.success(null));
    }
}