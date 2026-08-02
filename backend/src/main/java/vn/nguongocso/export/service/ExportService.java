package vn.nguongocso.export.service;

import org.springframework.core.io.Resource;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.export.dto.request.ExportOpenDataRequest;

public interface ExportService {
    Resource exportOpenData(ExportOpenDataRequest request, CustomUserDetails currentUser);
}