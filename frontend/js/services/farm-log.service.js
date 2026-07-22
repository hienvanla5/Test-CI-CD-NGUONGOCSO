import {
    apiRequest
} from "../core/api-client.js";

export async function createFarmLog(
    requestBody
) {
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