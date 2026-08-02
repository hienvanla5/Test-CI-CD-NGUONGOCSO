package vn.nguongocso.trace.service;

import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;
import vn.nguongocso.trace.dto.response.ProcurementShipmentResponse;
import vn.nguongocso.trace.dto.response.ShipmentSummaryResponse;

import java.util.List;
import java.util.UUID;


/**
 * Định nghĩa các nghiệp vụ quản lý lô hàng và sinh mã truy xuất.
 */
public interface ShipmentService {

    /**
     * Tạo lô hàng từ lô sản xuất và sinh mã truy xuất tương ứng.
     *
     * @param request thông tin tạo lô hàng
     * @return thông tin lô hàng sau khi tạo
     */
	ShipmentResponse createShipment(CreateShipmentRequest request);
    ShipmentResponse activateShipmentStamps(UUID shipmentId);

    List<ShipmentResponse> getShipmentsByProductionLot(UUID productionLotId);

    /**
     * Tra cứu lô hàng bằng mã truy xuất (codeValue in trên tem QR).
     *
     * @param code mã truy xuất
     * @return thông tin tóm tắt của lô hàng
     * @throws BusinessException nếu không tìm thấy mã truy xuất
     */
    ShipmentSummaryResponse getShipmentByCode(String code);

    /**
     * Lấy danh sách lô hàng đủ điều kiện thu mua (status = ACTIVATED).
     * Dùng cho Doanh nghiệp thu mua (VT‑04).
     *
     * @return danh sách lô hàng sẵn sàng thu mua
     */
    List<ProcurementShipmentResponse> getEligibleShipments();
}
