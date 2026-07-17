package vn.nguongocso.auth.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import vn.nguongocso.auth.entity.ProductCategory;
import java.util.UUID;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
    
}

