package vn.nguongocso.farm.service;

import vn.nguongocso.farm.dto.request.CreateProductFeedbackRequest;
import vn.nguongocso.farm.dto.response.ProductFeedbackResponse;
import java.util.UUID;

/** Ghi nhận phản ánh sản phẩm. */
public interface ProductFeedbackService {
    /** Tạo phản ánh mới cho lô sản xuất. */
    ProductFeedbackResponse createFeedback(UUID productionLotId, CreateProductFeedbackRequest request);
}
