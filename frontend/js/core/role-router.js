import {
    getUser
} from "./storage.js";

const ORGANIZATION_ROUTES = {
    SYSTEM:
        "/pages/admin/dashboard.html",

    COOPERATIVE:
        "/pages/cooperative/dashboard.html",

    ENTERPRISE:
        "/pages/enterprise/dashboard.html",

    GOVERNMENT:
        "/pages/government/dashboard.html"
};

export function redirectByOrganizationType() {

    const user = getUser();

    console.log(
        "Current user:",
        user
    );

    if (!user) {
        window.location.href =
            "/pages/auth/login.html";

        return;
    }

    const organizationType =
        user.organizationType;

    console.log(
        "Organization type:",
        organizationType
    );

    const route =
        ORGANIZATION_ROUTES[
            organizationType
        ];

    if (!route) {

        console.error(
            "Unknown organization type:",
            organizationType
        );

        return;
    }

    window.location.href = route;
}