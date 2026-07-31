package vn.nguongocso.farm.service;

import java.util.List;
import java.util.UUID;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.CreateProductCategoryRequest;
import vn.nguongocso.farm.dto.request.UpdateProductCategoryRequest;
import vn.nguongocso.farm.dto.response.ProductCategoryResponse;

/**
 * Định nghĩa các nghiệp vụ liên quan đến danh mục loại cây trồng.
 */
public interface ProductCategoryService {

	/**
	 * Lấy danh sách tất cả các loại cây trồng đang hoạt động.
	 *
	 * @return danh sách thông tin loại cây trồng
	 */
	List<ProductCategoryResponse> getAll();
	List<ProductCategoryResponse> search(String name, String group, Boolean isActive, CustomUserDetails currentUser);
	ProductCategoryResponse create(CreateProductCategoryRequest request);
	ProductCategoryResponse update(UUID id, UpdateProductCategoryRequest request);
}