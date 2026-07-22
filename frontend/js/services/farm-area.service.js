import { apiRequest } from "../core/api-client.js";

/**
 * Create a new farm area.
 *
 * The backend only exposes POST /api/v1/farm-areas.
 * No GET endpoint exists for listing farm areas.
 *
 * @param {Object} farmAreaData - The farm area data matching CreateFarmAreaRequest DTO.
 * @returns {Promise<Object>} API response.
 */
export async function createFarmArea(farmAreaData) {
    return apiRequest(
        "/farm-areas",
        {
            method: "POST",
            body: JSON.stringify(farmAreaData)
        }
    );
}

/**
 * Fetch all product categories (crop types).
 * The backend returns ProductCategoryResponse: { id: UUID, name: String }.
 *
 * @returns {Promise<Object>} API response with data array.
 */
export async function getProductCategories() {
    return apiRequest(
        "/product-categories",
        {
            method: "GET"
        }
    );
}