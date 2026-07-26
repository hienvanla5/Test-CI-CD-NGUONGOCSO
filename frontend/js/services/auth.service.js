import {
    apiRequest
} from "../core/api-client.js";

export function login(loginData) {
    return apiRequest(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify(loginData)
        }
    );
}

export function getCurrentUser() {
    return apiRequest("/auth/me");
}
