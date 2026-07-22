import {
    apiRequest
} from "../core/api-client.js";

export async function getMembers() {
    return apiRequest(
        "/organization/members",
        {
            method: "GET"
        }
    );
}

export async function getRoles() {
    return apiRequest(
        "/roles",
        {
            method: "GET"
        }
    );
}

export async function assignRole(request) {
    return apiRequest(
        "/organization/members/roles",
        {
            method: "PUT",
            body: JSON.stringify(request)
        }
    );
}

export async function addMember(request) {
    return apiRequest(
        "/organization/members",
        {
            method: "POST",
            body: JSON.stringify(request)
        }
    );
}