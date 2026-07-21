import {
    apiRequest
} from "../core/api-client.js";

/**
 * Create a new production lot.
 *
 * POST /api/v1/production-lots
 *
 * @param {Object} productionLotData
 * @returns {Promise<Object>}
 */
export async function createProductionLot(
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
 * Fetch all farm areas for the
 * authenticated organization.
 *
 * GET /api/v1/farm-areas
 *
 * @returns {Promise<Object>}
 */
export async function getFarmAreas() {
    return apiRequest(
        "/farm-areas",
        {
            method: "GET"
        }
    );
}

/**
 * Fetch all product categories.
 *
 * GET /api/v1/product-categories
 *
 * @returns {Promise<Object>}
 */
export async function getProductCategories() {
    return apiRequest(
        "/product-categories",
        {
            method: "GET"
        }
    );
}

/**
 * Fetch all production lots for the
 * authenticated organization.
 *
 * GET /api/v1/production-lots
 *
 * @returns {Promise<Object>}
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
 * Update a production lot.
 *
 * Chỉ lô có trạng thái DRAFT
 * mới được chỉnh sửa.
 *
 * PUT /api/v1/production-lots/{id}
 *
 * @param {string} id
 * @param {Object} productionLotData
 * @returns {Promise<Object>}
 */
export async function updateProductionLot(
    id,
    productionLotData
) {
    return apiRequest(
        `/production-lots/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            body: JSON.stringify(
                productionLotData
            )
        }
    );
}

/**
 * Submit a production lot for approval.
 *
 * Chuyển trạng thái:
 * DRAFT -> PENDING
 *
 * PUT /api/v1/production-lots/{id}/submit
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function submitProductionLot(
    id
) {
    return apiRequest(
        `/production-lots/${encodeURIComponent(id)}/submit`,
        {
            method: "PUT"
        }
    );
}