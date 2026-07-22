package vn.nguongocso.farm.service;

import java.util.List;
import java.util.UUID;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;

public interface FarmLogService {

	FarmLogResponse create(CreateFarmLogRequest request);

	List<FarmLogResponse> getLogsByProductionLot(UUID productionLotId);
}
