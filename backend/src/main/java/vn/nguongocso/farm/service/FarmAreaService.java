package vn.nguongocso.farm.service;

import vn.nguongocso.farm.dto.request.CreateFarmAreaRequest;
import vn.nguongocso.farm.dto.response.FarmAreaResponse;

/**
 * Service xử lý nghiệp vụ vùng trồng.
 */
public interface FarmAreaService {

	/**
	 * Tạo mới vùng trồng.
	 *
	 * @param request thông tin vùng trồng cần tạo
	 * @return thông tin vùng trồng sau khi tạo
	 */
	FarmAreaResponse create(CreateFarmAreaRequest request);
}