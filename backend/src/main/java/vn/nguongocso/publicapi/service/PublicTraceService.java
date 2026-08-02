package vn.nguongocso.publicapi.service;

<<<<<<< HEAD
import vn.nguongocso.publicapi.dto.response.PublicLotCertificationsResponse;
=======
>>>>>>> feature/remove-projection-lot
import vn.nguongocso.publicapi.dto.response.PublicTraceResponse;

public interface PublicTraceService {
    PublicTraceResponse getPublicTrace(String codeValue, Double latitude, Double longitude, String location, String ipAddress, String userAgent);
<<<<<<< HEAD

    PublicLotCertificationsResponse getPublicCertifications(String codeValue);
=======
>>>>>>> feature/remove-projection-lot
}