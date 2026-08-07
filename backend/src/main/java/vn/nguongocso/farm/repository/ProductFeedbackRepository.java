package vn.nguongocso.farm.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.farm.entity.ProductFeedback;
import java.util.UUID;

/**
 * Repository thao tác dữ liệu phản hồi sản phẩm.
 */
public interface ProductFeedbackRepository extends JpaRepository<ProductFeedback, UUID> {
}
