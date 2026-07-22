import {
    apiRequest
} from "../core/api-client.js";

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
) {
    return apiRequest(
        "/farm-logs",
        {
            method: "POST",
            body: JSON.stringify(
                farmLogData
            )
        }
    );
}