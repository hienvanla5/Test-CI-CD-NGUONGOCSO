import {
    apiRequest
} from "../core/api-client.js";

/*
 * Tạo một nhật ký canh tác mới.
 */
export async function createFarmLog(
    requestBody
) {
    if (!requestBody) {
        throw new Error(
            "Thiếu dữ liệu nhật ký canh tác."
        );
    }

    if (!requestBody.productionLotId) {
        throw new Error(
            "Thiếu productionLotId."
        );
    }

    if (!requestBody.activityType) {
        throw new Error(
            "Thiếu loại hoạt động."
        );
    }

    if (!requestBody.executedDate) {
        throw new Error(
            "Thiếu ngày thực hiện."
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

/*
 * Lấy lịch sử nhật ký của một lô sản xuất.
 */
export async function getFarmLogHistory(
    productionLotId,
    page = 0,
    size = 10
) {
    if (!productionLotId) {
        throw new Error(
            "Thiếu productionLotId."
        );
    }

    const queryParams =
        new URLSearchParams({
            productionLotId,
            page: String(page),
            size: String(size)
        });

    return apiRequest(
        `/farm-logs?${queryParams.toString()}`,
        {
            method: "GET"
        }
    );
}