package vn.nguongocso.publicapi.service;

import vn.nguongocso.publicapi.dto.response.PublicLotCertificationsResponse;
import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;

public interface PublicTraceService {
    PublicTraceResponse getPublicTrace(String codeValue, Double latitude, Double longitude, String location, String ipAddress, String userAgent);

    PublicLotCertificationsResponse getPublicCertifications(String codeValue);
}