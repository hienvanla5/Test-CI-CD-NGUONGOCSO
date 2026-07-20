import {
    apiRequest
} from "../core/api-client.js";

export async function createOrganization(
    organizationData
) {
    return apiRequest(
        "/admin/organizations",
        {
            method: "POST",

            body: JSON.stringify(
                organizationData
            )
        }
    );
}