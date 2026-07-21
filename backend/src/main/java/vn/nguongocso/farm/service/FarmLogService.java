package vn.nguongocso.farm.service;

import java.util.List;
import java.util.UUID;
import vn.nguongocso.farm.dto.request.CreateFarmLogRequest;
import vn.nguongocso.farm.dto.response.FarmLogResponse;

/**
 * Nghiệp vụ quản lý nhật ký canh tác.
 */
public interface FarmLogService {

    /**
     * Tạo nhật ký canh tác.
     *
     * @param request thông tin nhật ký
     * @return thông tin nhật ký đã tạo
     */
	FarmLogResponse create(CreateFarmLogRequest request);

	List<FarmLogResponse> getLogsByProductionLot(UUID productionLotId);
}
