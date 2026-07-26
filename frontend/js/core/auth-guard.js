import {
    isAuthenticated,
    getUser,
    clearAuth
} from "./storage.js";

const LOGIN_URL =
    "/frontend/pages/auth/login.html";

const DEFAULT_ROUTES = Object.freeze({
    "VT-01":
        "/frontend/pages/admin/dashboard.html",

    "VT-02":
        "/frontend/pages/cooperative/dashboard.html",

    "VT-03":
        "/frontend/pages/cooperative/production-lots/index.html",

    "VT-04":
        "/frontend/pages/enterprise/dashboard.html",

    "VT-05":
        "/frontend/pages/government/dashboard.html"
});

/**
 * Chuyển người dùng về trang đăng nhập.
 */
export function redirectToLogin() {
    if (
        window.location.pathname !==
        LOGIN_URL
    ) {
        window.location.href =
            LOGIN_URL;
    }
}

/**
 * Kiểm tra người dùng đã đăng nhập hay chưa.
 *
 * Cần có cả access token và currentUser.
 */
export function requireAuth() {
    if (!isAuthenticated()) {
        clearAuth();
        redirectToLogin();

        return false;
    }

    const user = getUser();

    if (
        !user ||
        !user.roleCode
    ) {
        clearAuth();
        redirectToLogin();

        return false;
    }

    return true;
}

/**
 * Kiểm tra user có thuộc một role cụ thể không.
 */
export function hasRole(roleCode) {
    const user = getUser();

    if (
        !user ||
        !user.roleCode ||
        !roleCode
    ) {
        return false;
    }

    return (
        user.roleCode === roleCode
    );
}

/**
 * Kiểm tra user có thuộc một trong
 * các role được phép không.
 */
export function hasAnyRole(
    allowedRoles
) {
    const user = getUser();

    if (
        !user ||
        !user.roleCode
    ) {
        return false;
    }

    const normalizedRoles =
        Array.isArray(allowedRoles)
            ? allowedRoles
            : [allowedRoles];

    return normalizedRoles.includes(
        user.roleCode
    );
}

/**
 * Kiểm tra đăng nhập và role.
 *
 * Không tự chuyển trang khi sai role.
 * Page JS sẽ hiển thị unauthorizedState.
 */
export function requireRole(roleCode) {
    if (!requireAuth()) {
        return false;
    }

    return hasRole(roleCode);
}

/**
 * Kiểm tra đăng nhập và nhiều role.
 */
export function requireAnyRole(
    allowedRoles
) {
    if (!requireAuth()) {
        return false;
    }

    return hasAnyRole(
        allowedRoles
    );
}

/**
 * Lấy trang mặc định theo role.
 */
export function getDefaultRoute(
    roleCode
) {
    return (
        DEFAULT_ROUTES[roleCode] ||
        null
    );
}

/**
 * Nếu người dùng đã đăng nhập,
 * chuyển khỏi trang đăng nhập
 * đến trang phù hợp với role.
 */
export function redirectIfAuthenticated() {
    if (!isAuthenticated()) {
        return false;
    }

    const user = getUser();

    if (
        !user ||
        !user.roleCode
    ) {
        clearAuth();

        return false;
    }

    const targetRoute =
        getDefaultRoute(
            user.roleCode
        );

    if (!targetRoute) {
        clearAuth();

        return false;
    }

    window.location.href =
        targetRoute;

    return true;
}

/**
 * Đăng xuất người dùng.
 */
export function logout() {
    clearAuth();

    window.location.href =
        LOGIN_URL;
}

/**
 * Gắn sự kiện đăng xuất vào button.
 */
export function setupLogout(
    logoutButtonId =
        "logoutButton"
) {
    const logoutButton =
        document.getElementById(
            logoutButtonId
        );

    if (!logoutButton) {
        return false;
    }

    /*
     * Tránh gắn trùng sự kiện nếu hàm
     * được gọi nhiều lần.
     */
    if (
        logoutButton.dataset
            .logoutBound === "true"
    ) {
        return true;
    }

    logoutButton.dataset
        .logoutBound = "true";

    logoutButton.addEventListener(
        "click",
        function (event) {
            event.preventDefault();
            logout();
        }
    );

    return true;
}