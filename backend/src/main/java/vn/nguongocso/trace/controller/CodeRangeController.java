package vn.nguongocso.trace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.trace.dto.request.CreateCodeRangeRequest;
import vn.nguongocso.trace.dto.response.CodeRangeResponse;
import vn.nguongocso.trace.service.CodeRangeService;

@RestController
@RequestMapping("/api/v1/admin/code-ranges")
@RequiredArgsConstructor
public class CodeRangeController {

    private final CodeRangeService codeRangeService;

    @PostMapping
    @PreAuthorize("hasRole('VT-01')")
    public ResponseEntity<ApiResult<CodeRangeResponse>> createCodeRange(
            @Valid @RequestBody CreateCodeRangeRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {
        CodeRangeResponse response = codeRangeService.createCodeRange(request, admin);
        return ResponseEntity.ok(ApiResult.success(response));
    }
}
