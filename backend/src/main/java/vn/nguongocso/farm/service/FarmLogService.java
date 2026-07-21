package vn.nguongocso.farm.service;

import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;

public interface FarmLogService {

	FarmLogResponse create(CreateFarmLogRequest request);
}
