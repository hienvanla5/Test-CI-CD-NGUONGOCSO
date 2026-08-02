// PublicTraceController.java
package vn.nguongocso.publicapi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.permission.service.PermissionChecker;
import vn.nguongocso.publicapi.dto.response.PublicLotCertificationsResponse;
import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;
import vn.nguongocso.publicapi.service.PublicTraceService;

@RestController
@RequestMapping("/api/v1/public/trace")
@RequiredArgsConstructor
public class PublicTraceController {

    private final PublicTraceService publicTraceService;
    private final PermissionChecker permissionChecker;

    @GetMapping("/{codeValue}")
    public ResponseEntity<ApiResult<PublicTraceResponse>> getPublicTrace(
            @PathVariable String codeValue,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String location,
            HttpServletRequest request) {

        permissionChecker.check("TRACEABILITY", "READ");

        PublicTraceResponse response = publicTraceService.getPublicTrace(
                codeValue,
                latitude,
                longitude,
                location,
                request.getRemoteAddr(),
                request.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResult.success(response));
    }

    @GetMapping("/{codeValue}/certifications")
    public ResponseEntity<ApiResult<PublicLotCertificationsResponse>> getPublicCertifications(
            @PathVariable String codeValue) {

        permissionChecker.check("TRACEABILITY", "READ");

        PublicLotCertificationsResponse response =
                publicTraceService.getPublicCertifications(codeValue);

        return ResponseEntity.ok(ApiResult.success(response));
    }
}