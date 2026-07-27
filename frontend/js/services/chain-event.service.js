import {
    apiRequest
} from "../core/api-client.js";

/**
 * Ghi nhận thu hoạch và chuyển lô:
 * APPROVED -> HARVESTED.
 */
export function recordHarvestEvent(
    harvestData
) {
    return apiRequest(
        "/chain-events/harvest",
        {
            method: "POST",
            body: JSON.stringify(
                harvestData
            )
        }
    );
}

/**
 * Ghi nhận đóng gói và chuyển lô:
 * HARVESTED -> PACKAGED.
 */
export function recordPackagingEvent(
    packagingData
) {
    return apiRequest(
        "/chain-events/packaging",
        {
            method: "POST",
            body: JSON.stringify(
                packagingData
            )
        }
    );
}
