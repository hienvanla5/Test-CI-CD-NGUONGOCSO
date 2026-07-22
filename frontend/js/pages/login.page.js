import {
    authenticate
} from "../core/auth-manager.js";

import {
    redirectByRole
} from "../core/role-router.js";


const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const organizationCodeInput =
    document.getElementById(
        "organizationCode"
    );

const submitButton =
    document.querySelector(
        "#loginForm .btn-primary"
    );

const submitButtonText =
    submitButton
        ? submitButton.querySelector(
              ".btn-text"
          )
        : null;

function validateForm() {
    const errors = [];

    if (
        !usernameInput.value ||
        !usernameInput.value.trim()
    ) {
        errors.push(
            "Vui lòng nhập tên đăng nhập."
        );
    }

    if (
        !passwordInput.value ||
        !passwordInput.value.trim()
    ) {
        errors.push(
            "Vui lòng nhập mật khẩu."
        );
    }

    if (
        !organizationCodeInput.value ||
        !organizationCodeInput.value.trim()
    ) {
        errors.push(
            "Vui lòng nhập mã tổ chức."
        );
    }

    return errors;
}

function setLoading(isLoading) {
    if (!submitButton) return;

    submitButton.disabled =
        isLoading;

    if (submitButtonText) {
        submitButtonText.textContent =
            isLoading
                ? "Đang đăng nhập..."
                : "Đăng nhập";
    } else {
        submitButton.textContent =
            isLoading
                ? "Đang đăng nhập..."
                : "Đăng nhập";
    }
}

function clearFieldErrors() {
    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(function (el) {
            el.remove();
        });

    document
        .querySelectorAll(
            ".form-group.has-error"
        )
        .forEach(function (el) {
            el.classList.remove(
                "has-error"
            );
        });
}

function showFieldError(
    fieldId,
    message
) {
    const field =
        document.getElementById(
            fieldId
        );

    if (!field) return;

    const formGroup =
        field.closest(
            ".form-group"
        );

    if (formGroup) {
        formGroup.classList.add(
            "has-error"
        );
    }

    const existingError =
        field.parentElement.querySelector(
            ".field-error"
        );

    if (existingError) return;

    const errorEl =
        document.createElement(
            "span"
        );

    errorEl.className =
        "field-error";

    errorEl.textContent =
        message;

    field.parentElement.appendChild(
        errorEl
    );
}

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";
        clearFieldErrors();

        const validationErrors =
            validateForm();

        if (
            validationErrors.length > 0
        ) {
            if (
                !usernameInput.value.trim()
            ) {
                showFieldError(
                    "username",
                    "Vui lòng nhập tên đăng nhập."
                );
            }

            if (
                !passwordInput.value.trim()
            ) {
                showFieldError(
                    "password",
                    "Vui lòng nhập mật khẩu."
                );
            }

            if (
                !organizationCodeInput.value.trim()
            ) {
                showFieldError(
                    "organizationCode",
                    "Vui lòng nhập mã tổ chức."
                );
            }

            loginError.textContent =
                "Vui lòng điền đầy đủ các trường bắt buộc.";

            return;
        }

        const loginData = {
            username:
                usernameInput.value.trim(),

            password:
                passwordInput.value,

            organizationCode:
                organizationCodeInput.value.trim()
        };

        setLoading(true);

        try {

            const user =
                await authenticate(
                    loginData
                );

            console.log(
                "Logged in user:",
                user
            );

            redirectByRole();

        } catch (error) {

            console.error(error);

            loginError.textContent =
                error.message;

            setLoading(false);
        }
    }
);
