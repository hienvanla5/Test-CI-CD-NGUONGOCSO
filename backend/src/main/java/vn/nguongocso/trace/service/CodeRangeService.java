package vn.nguongocso.trace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.organization.repository.OrganizationRepository;
import vn.nguongocso.trace.dto.request.CreateCodeRangeRequest;
import vn.nguongocso.trace.dto.response.CodeRangeResponse;
import vn.nguongocso.trace.repository.CodeRangeRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodeRangeService {

    private final CodeRangeRepository codeRangeRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public CodeRangeResponse createCodeRange(CreateCodeRangeRequest request, CustomUserDetails admin) {
        return null;
    }
}
