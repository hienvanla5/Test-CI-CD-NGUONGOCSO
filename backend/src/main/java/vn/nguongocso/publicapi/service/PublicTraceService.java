package vn.nguongocso.publicapi.service;

import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;

public interface PublicTraceService {
    PublicTraceResponse getPublicTrace(String codeValue);
}