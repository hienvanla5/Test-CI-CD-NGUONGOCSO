package vn.nguongocso.farm.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.farm.dto.response.ProductCategoryResponse;
import vn.nguongocso.farm.repository.ProductCategoryRepository;
import vn.nguongocso.farm.service.ProductCategoryService;

/**
 * Triển khai nghiệp vụ danh mục loại cây trồng.
 */
@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {

	private final ProductCategoryRepository productCategoryRepository;

	/**
	 * Lấy danh sách loại cây trồng.
	 *
	 * @return danh sách loại cây trồng
	 */
	@Override
	public List<ProductCategoryResponse> getAll() {

		return productCategoryRepository.findAll().stream()
				.map(category -> new ProductCategoryResponse(category.getId(), category.getName())).toList();
	}
}
