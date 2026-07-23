import { apiRequest } from "../core/api-client.js";

/**
 * Create a new production lot.
 *
 * POST /api/v1/production-lots
 *
 * @param {Object} productionLotData - The production lot data matching CreateProductionLotRequest DTO.
 * @returns {Promise<Object>} API response.
 */
export async function createProductionLot(productionLotData) {
    return apiRequest(
        "/production-lots",
        {
            method: "POST",
            body: JSON.stringify(productionLotData)
        }
    );
}

/**
 * Fetch all farm areas for the authenticated organization.
 *
 * GET /api/v1/farm-areas
 *
 * @returns {Promise<Object>} API response with data array of farm areas.
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
 * Fetch all product categories (crop types).
 *
 * GET /api/v1/product-categories
 *
 * @returns {Promise<Object>} API response with data array of product categories.
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
 * Fetch all production lots for the authenticated organization.
 *
 * GET /api/v1/production-lots
 *
 * Note: This endpoint may not be implemented yet on the backend.
 * The frontend list page is designed to work when the endpoint becomes available.
 *
 * @returns {Promise<Object>} API response with data array of production lots.
 */
export async function getProductionLots() {
    return apiRequest(
        "/production-lots",
        {
            method: "GET"
        }
    );
}
// production-lot.service.js

/**
 * Update a production lot
 * PUT /api/v1/production-lots/:id
 */
export async function updateProductionLot(id, productionLotData) {
    return apiRequest(
        `/production-lots/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(productionLotData)
        }
    );
}