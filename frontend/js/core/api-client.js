import {
    getToken,
    getTokenType,
    clearAuth
} from "./storage.js";

export const API_BASE_URL =
    "http://localhost:8080/api/v1";

const LOGIN_URL =
    "/frontend/pages/auth/login.html";

/**
 * Tạo URL đầy đủ từ endpoint.
 *
 * Ví dụ:
 * /farm-logs
 * -> http://localhost:8080/api/v1/farm-logs
 */
function buildApiUrl(endpoint) {
    const endpointValue =
        String(endpoint || "").trim();

    if (!endpointValue) {
        throw new Error(
            "Endpoint API không hợp lệ."
        );
    }

    if (
        endpointValue.startsWith("http://") ||
        endpointValue.startsWith("https://")
    ) {
        return endpointValue;
    }

    const normalizedEndpoint =
        endpointValue.startsWith("/")
            ? endpointValue
            : `/${endpointValue}`;

    return (
        API_BASE_URL +
        normalizedEndpoint
    );
}

/**
 * Tạo headers cho request.
 *
 * Không tự đặt Content-Type khi body là FormData
 * để trình duyệt tự thêm multipart boundary.
 */
function buildHeaders(options) {
    const headers =
        new Headers(
            options.headers || {}
        );

    if (!headers.has("Accept")) {
        headers.set(
            "Accept",
            "application/json"
        );
    }

    const isFormData =
        typeof FormData !== "undefined" &&
        options.body instanceof FormData;

    if (
        options.body !== undefined &&
        options.body !== null &&
        !isFormData &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    const token = getToken();

    if (
        token &&
        !headers.has("Authorization")
    ) {
        const tokenType =
            getTokenType() ||
            "Bearer";

        headers.set(
            "Authorization",
            `${tokenType} ${token}`
        );
    }

    return headers;
}

/**
 * Đọc response body.
 *
 * API có thể trả JSON, text hoặc không có body.
 */
async function parseResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    const responseText =
        await response.text();

    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        return responseText;
    }
}

/**
 * Lấy message lỗi từ response backend.
 */
function getErrorMessage(
    response,
    responseData
) {
    if (
        responseData &&
        typeof responseData === "object" &&
        responseData.message
    ) {
        return responseData.message;
    }

    if (
        typeof responseData === "string" &&
        responseData.trim()
    ) {
        return responseData;
    }

    return (
        `Yêu cầu thất bại: HTTP ${response.status}`
    );
}

/**
 * Xử lý khi phiên đăng nhập hết hạn.
 */
function handleUnauthorized() {
    clearAuth();

    if (
        window.location.pathname !==
        LOGIN_URL
    ) {
        window.location.href =
            LOGIN_URL;
    }
}

/**
 * Hàm gọi API dùng chung toàn frontend.
 *
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<unknown>}
 */
export async function apiRequest(
    endpoint,
    options = {}
) {
    const url =
        buildApiUrl(endpoint);

    const requestOptions = {
        ...options,
        headers: buildHeaders(options)
    };

    let response;

    try {
        response = await fetch(
            url,
            requestOptions
        );
    } catch (error) {
        const networkError =
            new Error(
                "Không thể kết nối đến máy chủ."
            );

        networkError.cause = error;

        throw networkError;
    }

    const responseData =
        await parseResponseBody(response);

    if (response.status === 401) {
        handleUnauthorized();

        const unauthorizedError =
            new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        unauthorizedError.status = 401;
        unauthorizedError.data =
            responseData;

        throw unauthorizedError;
    }

    if (!response.ok) {
        const apiError =
            new Error(
                getErrorMessage(
                    response,
                    responseData
                )
            );

        apiError.status =
            response.status;

        apiError.data =
            responseData;

        throw apiError;
    }

    return responseData;
}