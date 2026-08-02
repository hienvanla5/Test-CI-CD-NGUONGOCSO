package vn.nguongocso.farm.service;

import vn.nguongocso.farm.dto.request.CreateProductFeedbackRequest;
import vn.nguongocso.farm.dto.response.ProductFeedbackResponse;
import java.util.UUID;

public interface ProductFeedbackService {
    ProductFeedbackResponse createFeedback(UUID productionLotId, CreateProductFeedbackRequest request);
}
