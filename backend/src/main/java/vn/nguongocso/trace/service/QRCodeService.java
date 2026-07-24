package vn.nguongocso.trace.service;

import java.util.UUID;

public interface QRCodeService {
    String generateQRCode(String codeValue, UUID organizationId, UUID productionLotId, UUID shipmentId);
}
