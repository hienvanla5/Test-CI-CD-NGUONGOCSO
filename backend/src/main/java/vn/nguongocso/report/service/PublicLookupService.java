package vn.nguongocso.report.service;

import vn.nguongocso.report.dto.response.LookupResponse;

/**
 * Service tra cứu công khai mã truy xuất.
 *
 * @author Triệu Văn Đại
 */
public interface PublicLookupService {

    /**
     * Tra cứu mã truy xuất công khai.
     */
    LookupResponse lookupCode(String codeValue, Double latitude, Double longitude,
                              String location, String ipAddress, String userAgent);
}