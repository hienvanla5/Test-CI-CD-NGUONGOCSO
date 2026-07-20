import {
    getUser
} from "./storage.js";

const ROLE_ROUTES = {
    "VT-01":
        "/frontend/pages/admin/dashboard.html",

    "VT-02":
        "/frontend/pages/cooperative/dashboard.html",

    "VT-03":
        "/frontend/pages/cooperative/dashboard.html",

    "VT-04":
        "/frontend/pages/enterprise/dashboard.html",

    "VT-05":
        "/frontend/pages/government/dashboard.html"
};

export function redirectByRole() {

    const user = getUser();

    console.log(
        "Current user:",
        user
    );

    if (!user) {
        window.location.href =
            "/frontend/pages/auth/login.html";

        return;
    }

    const roleCode = user.roleCode;

    console.log(
        "Role code:",
        roleCode
    );

    const route =
        ROLE_ROUTES[roleCode];

    if (!route) {

        console.error(
            "Unknown role code:",
            roleCode
        );

        window.location.href =
            "/frontend/pages/auth/login.html";

        return;
    }

    window.location.href = route;
}
