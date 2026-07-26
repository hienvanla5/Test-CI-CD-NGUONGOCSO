import {
    apiRequest
} from "../core/api-client.js";

/**
 * Tạo một nhật ký canh tác.
 *
 * Chỉ VT-03 được phép thực hiện.
 *
 * POST /api/v1/farm-logs
 *
 * @param {Object} requestBody
 * @returns {Promise<unknown>}
 */
export async function createFarmLog(
    requestBody
) {
    if (
        !requestBody ||
        typeof requestBody !== "object"
    ) {
        throw new TypeError(
            "Dữ liệu nhật ký không hợp lệ."
        );
    }

    return apiRequest(
        "/farm-logs",
        {
            method: "POST",

            body: JSON.stringify(
                requestBody
            )
        }
    );
}

/**
 * Lấy lịch sử nhật ký của một lô
 * sản xuất theo phân trang.
 *
 * Chỉ VT-02 được phép thực hiện.
 *
 * GET /api/v1/farm-logs
 *
 * @param {string} productionLotId
 * @param {number} page Trang bắt đầu từ 0
 * @param {number} size Số bản ghi mỗi trang
 * @returns {Promise<unknown>}
 */
export async function getFarmLogHistory(
    productionLotId,
    page = 0,
    size = 10
) {
    const normalizedProductionLotId =
        String(
            productionLotId || ""
        ).trim();

    if (!normalizedProductionLotId) {
        throw new TypeError(
            "Thiếu mã lô sản xuất."
        );
    }

    const normalizedPage =
        Number.isInteger(Number(page)) &&
        Number(page) >= 0
            ? Number(page)
            : 0;

    const normalizedSize =
        Number.isInteger(Number(size)) &&
        Number(size) > 0
            ? Number(size)
            : 10;

    const queryParams =
        new URLSearchParams({
            productionLotId:
                normalizedProductionLotId,

            page:
                String(normalizedPage),

            size:
                String(normalizedSize)
        });

    return apiRequest(
        `/farm-logs?${queryParams.toString()}`,
        {
            method: "GET"
        }
    );
}