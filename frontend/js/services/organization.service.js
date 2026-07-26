import {
    apiRequest
} from "../core/api-client.js";

export async function getOrganizations() {
    return apiRequest(
        "/admin/organizations",
        {
            method: "GET"
        }
    );
}

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

export async function getOrganizationProfile() {
    return apiRequest(
        "/organizations/profile",
        {
            method: "GET"
        }
    );
}

export async function updateOrganizationProfile(
    profileData
) {
    return apiRequest(
        "/organizations/profile",
        {
            method: "PUT",
            body: JSON.stringify(
                profileData
            )
        }
    );
}
