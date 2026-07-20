package vn.nguongocso.farm.service;

import java.util.List;

import vn.nguongocso.farm.dto.response.ProductCategoryResponse;

public interface ProductCategoryService {
	List<ProductCategoryResponse> getAll();
}
