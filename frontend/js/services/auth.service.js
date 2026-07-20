import {
    apiRequest
} from "../core/api-client.js";

export async function login(loginData) {
    return apiRequest(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify(
                loginData
            )
        }
    );
}

export async function getCurrentUser() {
    return apiRequest(
        "/auth/me"
    );
}