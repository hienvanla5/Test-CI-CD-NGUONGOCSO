package vn.nguongocso.farm.service;

import java.util.List;

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
}