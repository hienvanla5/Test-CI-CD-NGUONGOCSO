import {
    apiRequest
} from "../core/api-client.js";

/**
 * Tạo lô sản xuất.
 */
export function createProductionLot(
    productionLotData
) {
    return apiRequest(
        "/production-lots",
        {
            method: "POST",
            body: JSON.stringify(
                productionLotData
            )
        }
    );
}

/**
 * Lấy danh sách vùng trồng phục vụ form tạo lô.
 */
export function getFarmAreas() {
    return apiRequest(
        "/farm-areas",
        {
            method: "GET"
        }
    );
}

/**
 * Lấy danh mục sản phẩm phục vụ form tạo lô.
 */
export function getProductCategories() {
    return apiRequest(
        "/product-categories",
        {
            method: "GET"
        }
    );
}

/**
 * Lấy danh sách lô sản xuất
 * thuộc tổ chức của người dùng hiện tại.
 *
 * GET /api/v1/production-lots
 *
 * API trả về:
 * ApiResult<Array<CreateProductionLotResponse>>
 */
export async function getProductionLots() {
    return apiRequest(
        "/production-lots",
        {
            method: "GET"
        }
    );
}

/**
 * Gửi duyệt lô sản xuất (DRAFT -> PENDING).
 *
 * POST /api/v1/production-lots/{id}/submit
 *
 * Lỗi thường gặp (theo API docs):
 * - 400: Lô không ở trạng thái DRAFT
 * - 400: Thiếu thông tin bắt buộc (vùng trồng, sản lượng)
 * - 403: Không có quyền
 * - 404: Không tìm thấy lô
 */
export async function submitProductionLot(id) {
    return apiRequest(
        `/production-lots/${id}/submit`,
        {
            method: "POST"
        }
    );
}