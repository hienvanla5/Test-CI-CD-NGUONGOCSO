import {
    apiRequest
} from "../core/api-client.js";

<<<<<<< HEAD
/**
 * Tạo một nhật ký canh tác.
 *
 * POST /api/v1/farm-logs
 *
 * @param {Object} farmLogData
 * @returns {Promise<Object>}
 */
export async function createFarmLog(
    farmLogData
=======
export async function createFarmLog(
    requestBody
>>>>>>> feature/view-farm-log
) {
    return apiRequest(
        "/farm-logs",
        {
            method: "POST",
<<<<<<< HEAD
            body: JSON.stringify(
                farmLogData
            )
        }
    );
=======

            body: JSON.stringify(
                requestBody
            )
        }
    );
}

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
>>>>>>> feature/view-farm-log
}