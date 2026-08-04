package vn.nguongocso.farm.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.ProductionLotImportRequest;
import vn.nguongocso.farm.dto.response.ProductionLotImportResultResponse;

/**
 * Cung cấp chức năng nhập dữ liệu lô sản xuất từ tệp.
 */
public interface ProductionLotImportService {

    /**
     * Nhập dữ liệu lô sản xuất từ tệp CSV.
     *
     * @param request thông tin tệp và tổ chức cần nhập
     * @param userDetails người dùng đang đăng nhập
     * @return kết quả nhập dữ liệu
     */
    ProductionLotImportResultResponse importProductionLots(
            ProductionLotImportRequest request,
            CustomUserDetails userDetails);

}