import {
    isAuthenticated,
    clearAuth,
    getUser
} from "./storage.js";

const ROLE_ROUTES = {
    "VT-01": "/frontend/pages/admin/dashboard.html",
    "VT-02": "/frontend/pages/cooperative/dashboard.html",
    "VT-03": "/frontend/pages/cooperative/dashboard.html",
    "VT-04": "/frontend/pages/enterprise/dashboard.html",
    "VT-05": "/frontend/pages/government/dashboard.html"
};

export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href =
            "/frontend/pages/auth/login.html";
        return false;
    }
    return true;
}

export function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        const user = getUser();
        if (user && user.roleCode) {
            const route = ROLE_ROUTES[user.roleCode];
            if (route) {
                window.location.href = route;
                return true;
            }
        }
    }
    return false;
}

export function setupLogout(
    logoutButtonId = "logoutButton"
) {
    const logoutButton =
        document.getElementById(
            logoutButtonId
        );

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                clearAuth();
                window.location.href =
                    "/frontend/pages/auth/login.html";
            }
        );
    }
}