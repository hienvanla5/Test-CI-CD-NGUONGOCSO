package vn.nguongocso.farm.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.nguongocso.farm.entity.ProductCategory;

/**
 * Repository thao tác dữ liệu danh mục loại cây trồng.
 */
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {
	List<ProductCategory> findByIsActiveTrueOrderByNameAsc();
}