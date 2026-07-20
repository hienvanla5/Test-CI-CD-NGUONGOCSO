const API_BASE_URL =
    "http://localhost:8080/api/v1";

export async function apiRequest(
    endpoint,
    options = {}
) {
    const token =
        localStorage.getItem(
            "accessToken"
        );

    const headers = {
        "Content-Type":
            "application/json",

        ...options.headers
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const responseText =
        await response.text();

    let data = null;

    if (responseText) {
        data = JSON.parse(
            responseText
        );
    }

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`
        );
    }

    return data;
}