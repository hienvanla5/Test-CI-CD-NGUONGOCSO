package vn.nguongocso.publicapi.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.nguongocso.common.ApiResult;
import vn.nguongocso.publicapi.dto.response.PublicLotCertificationsResponse;
import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;
import vn.nguongocso.publicapi.service.PublicTraceService;

@RestController
@RequestMapping("/api/v1/public/trace")
@RequiredArgsConstructor
public class PublicTraceController {

    private final PublicTraceService publicTraceService;

    /**
     * Tra cứu công khai thông tin lô và hành trình.
     */
    @GetMapping("/{codeValue}")
    public ResponseEntity<ApiResult<PublicTraceResponse>> getPublicTrace(
            @PathVariable String codeValue,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String location,
            HttpServletRequest request) {

        PublicTraceResponse response = publicTraceService.getPublicTrace(
                codeValue,
                latitude,
                longitude,
                location,
                request.getRemoteAddr(),
                request.getHeader("User-Agent"));

        return ResponseEntity.ok(ApiResult.success(response));
    }

    /**
     * Tra cứu danh sách chứng nhận của lô sản xuất.
     */
    @GetMapping("/{codeValue}/certifications")
    public ResponseEntity<ApiResult<PublicLotCertificationsResponse>> getPublicCertifications(
            @PathVariable String codeValue) {

        PublicLotCertificationsResponse response =
                publicTraceService.getPublicCertifications(codeValue);

        return ResponseEntity.ok(ApiResult.success(response));
    }
}