package vn.nguongocso.farm.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.farm.dto.response.ProductCategoryResponse;
import vn.nguongocso.farm.service.ProductCategoryService;

/**
 * REST Controller quản lý các API liên quan đến loại cây trồng.
 */
@RestController
@RequestMapping("/api/v1/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

	private final ProductCategoryService productCategoryService;

	/**
	 * Lấy danh sách tất cả các loại cây trồng.
	 *
	 * @return danh sách thông tin loại cây trồng
	 */
	@GetMapping
	public ResponseEntity<ApiResult<List<ProductCategoryResponse>>> getAll() {

		return ResponseEntity.ok(ApiResult.success(productCategoryService.getAll()));
	}
}