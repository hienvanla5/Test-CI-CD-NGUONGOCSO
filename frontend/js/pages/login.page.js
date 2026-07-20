import {
    authenticate
} from "../core/auth-manager.js";

import {
    redirectByOrganizationType
} from "../core/role-router.js";


const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const formData =
            new FormData(loginForm);

        const loginData = {
            username:
                formData.get(
                    "username"
                ),

            password:
                formData.get(
                    "password"
                ),

            organizationCode:
                formData.get(
                    "organizationCode"
                )
        };

        try {

            const user =
                await authenticate(
                    loginData
                );

            console.log(
                "Logged in user:",
                user
            );

            redirectByOrganizationType();

        } catch (error) {

            console.error(error);

            loginError.textContent =
                error.message;
        }
    }
);