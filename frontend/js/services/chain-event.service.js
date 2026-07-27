import {
    apiRequest
} from "../core/api-client.js";

/**
 * Ghi sự kiện thu hoạch cho lô sản xuất.
 *
 * Chỉ VT-02, VT-03 được phép thực hiện.
 *
 * POST /api/v1/chain-events/harvest
 *
 * @param {Object} requestBody
 * @returns {Promise<unknown>}
 */
export async function recordHarvestEvent(
    requestBody
) {
    if (
        !requestBody ||
        typeof requestBody !== "object"
    ) {
        throw new TypeError(
            "Dữ liệu sự kiện thu hoạch không hợp lệ."
        );
    }

    return apiRequest(
        "/chain-events/harvest",
        {
            method: "POST",

            body: JSON.stringify(
                requestBody
            )
        }
    );
}

/**
 * Ghi sự kiện đóng gói cho lô sản xuất.
 *
 * Chỉ VT-02, VT-03 được phép thực hiện.
 *
 * POST /api/v1/chain-events/packaging
 *
 * @param {Object} requestBody
 * @returns {Promise<unknown>}
 */
export async function recordPackagingEvent(
    requestBody
) {
    if (
        !requestBody ||
        typeof requestBody !== "object"
    ) {
        throw new TypeError(
            "Dữ liệu sự kiện đóng gói không hợp lệ."
        );
    }

    return apiRequest(
        "/chain-events/packaging",
        {
            method: "POST",

            body: JSON.stringify(
                requestBody
            )
        }
    );
}

/**
 * Tạo sự kiện đính chính thông tin đóng gói.
 *
 * Giữ nguyên sự kiện gốc, tạo bản ghi mới.
 *
 * Chỉ VT-02, VT-03 được phép thực hiện.
 *
 * POST /api/v1/chain-events/packaging/{id}/correct
 *
 * @param {string} originalEventId
 * @param {Object} requestBody
 * @returns {Promise<unknown>}
 */
export async function correctPackagingEvent(
    originalEventId,
    requestBody
) {
    const normalizedEventId =
        String(
            originalEventId || ""
        ).trim();

    if (!normalizedEventId) {
        throw new TypeError(
            "Thiếu mã sự kiện đóng gói gốc."
        );
    }

    if (
        !requestBody ||
        typeof requestBody !== "object"
    ) {
        throw new TypeError(
            "Dữ liệu đính chính không hợp lệ."
        );
    }

    return apiRequest(
        `/chain-events/packaging/${normalizedEventId}/correct`,
        {
            method: "POST",

            body: JSON.stringify(
                requestBody
            )
        }
    );
}

/**
 * Lấy dòng sự kiện chuỗi cung ứng của một lô sản xuất.
 *
 * LƯU Ý: Backend hiện CHƯA có endpoint GET để lấy
 * lịch sử sự kiện theo lô sản xuất hoặc lô hàng.
 * Hàm này được viết sẵn theo đúng quy ước của
 * apiRequest/api-client.js để khi backend bổ sung
 * API (ví dụ GET /api/v1/chain-events?productionLotId=...)
 * thì trang chỉ cần bỏ nhánh mock bên dưới.
 *
 * @param {string} productionLotId
 * @returns {Promise<unknown>}
 */
export async function getChainEventTimeline(
    productionLotId
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

    return apiRequest(
        `/chain-events?productionLotId=${encodeURIComponent(
            normalizedProductionLotId
        )}`,
        {
            method: "GET"
        }
    );
}