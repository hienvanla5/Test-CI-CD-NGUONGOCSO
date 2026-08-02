package vn.nguongocso.farm.service.impl;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguongocso.exception.ResourceNotFoundException;
import vn.nguongocso.farm.dto.request.CreateProductFeedbackRequest;
import vn.nguongocso.farm.dto.response.ProductFeedbackResponse;
import vn.nguongocso.farm.entity.ProductFeedback;
import vn.nguongocso.farm.entity.ProductionLot;
import vn.nguongocso.farm.event.ProductFeedbackSubmittedEvent;
import vn.nguongocso.farm.repository.ProductFeedbackRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;
import vn.nguongocso.farm.service.ProductFeedbackService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductFeedbackServiceImpl implements ProductFeedbackService {

    private static final Logger log = LoggerFactory.getLogger(ProductFeedbackServiceImpl.class);

    private final ProductFeedbackRepository productFeedbackRepository;
    private final ProductionLotRepository productionLotRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public ProductFeedbackResponse createFeedback(UUID productionLotId, CreateProductFeedbackRequest request) {
        log.info("Bắt đầu xử lý gửi phản ánh sản phẩm cho lô sản xuất ID: {}", productionLotId);

        // 1. Kiểm tra sự tồn tại của lô sản xuất
        ProductionLot productionLot = productionLotRepository.findById(productionLotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lô sản xuất"));

        // 2. Tạo entity ProductFeedback
        ProductFeedback feedback = ProductFeedback.builder()
                .productionLot(productionLot)
                .content(request.getContent())
                .build();

        // 3. Lưu vào cơ sở dữ liệu
        ProductFeedback savedFeedback = productFeedbackRepository.save(feedback);
        log.info("Đã lưu thành công phản ánh sản phẩm ID: {}", savedFeedback.getId());

        // 4. Phát sự kiện ProductFeedbackSubmittedEvent
        UUID orgId = productionLot.getOrganization() != null ? productionLot.getOrganization().getOrganizationId() : null;
        ProductFeedbackSubmittedEvent event = new ProductFeedbackSubmittedEvent(
                this,
                savedFeedback.getId(),
                productionLot.getId(),
                productionLot.getName(),
                orgId,
                savedFeedback.getContent()
        );
        eventPublisher.publishEvent(event);
        log.info("Đã phát sự kiện ProductFeedbackSubmittedEvent cho phản ánh ID: {}", savedFeedback.getId());

        // 5. Ánh xạ trả về Response DTO
        return ProductFeedbackResponse.builder()
                .id(savedFeedback.getId())
                .productionLotId(productionLot.getId())
                .productionLotName(productionLot.getName())
                .content(savedFeedback.getContent())
                .createdAt(savedFeedback.getCreatedAt())
                .build();
    }
}
