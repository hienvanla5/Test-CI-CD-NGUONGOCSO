import {
    getDefaultRoute,
    redirectIfAuthenticated
} from "../../core/auth-guard.js";

import {
    saveExpiresIn,
    saveToken,
    saveTokenType,
    saveUser
} from "../../core/storage.js";

import {
    login
} from "../../services/auth.service.js";

const elements = {
    form: document.getElementById("loginForm"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    organizationCode: document.getElementById("organizationCode"),
    usernameError: document.getElementById("usernameError"),
    passwordError: document.getElementById("passwordError"),
    loginError: document.getElementById("loginError"),
    loginButton: document.getElementById("loginButton")
};

function clearErrors() {
    if (elements.usernameError) {
        elements.usernameError.textContent = "";
    }

    if (elements.passwordError) {
        elements.passwordError.textContent = "";
    }

    if (elements.loginError) {
        elements.loginError.textContent = "";
    }

    [elements.username, elements.password].forEach((field) => {
        field?.classList.remove("input-error");
        field?.setAttribute("aria-invalid", "false");
    });
}

function setFieldError(field, errorElement, message) {
    field?.classList.add("input-error");
    field?.setAttribute("aria-invalid", "true");

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function validateForm() {
    let valid = true;

    if (!elements.username?.value.trim()) {
        setFieldError(
            elements.username,
            elements.usernameError,
            "Vui lòng nhập tên đăng nhập."
        );
        valid = false;
    }

    if (!elements.password?.value) {
        setFieldError(
            elements.password,
            elements.passwordError,
            "Vui lòng nhập mật khẩu."
        );
        valid = false;
    }

    return valid;
}

function setLoading(loading) {
    if (!elements.loginButton) {
        return;
    }

    elements.loginButton.disabled = loading;
    elements.loginButton.textContent = loading
        ? "Đang đăng nhập..."
        : "Đăng nhập";
}

function saveLoginData(loginData) {
    saveToken(loginData.accessToken);
    saveTokenType(loginData.tokenType || "Bearer");
    saveExpiresIn(loginData.expiresIn);
    saveUser(loginData.user);
}

async function handleSubmit(event) {
    event.preventDefault();
    clearErrors();

    if (!validateForm()) {
        if (elements.loginError) {
            elements.loginError.textContent =
                "Vui lòng kiểm tra lại thông tin đăng nhập.";
        }
        return;
    }

    const organizationCode =
        elements.organizationCode?.value.trim() || null;

    setLoading(true);

    try {
        const response = await login({
            username: elements.username.value.trim(),
            password: elements.password.value,
            organizationCode
        });

        if (
            !response ||
            response.success !== true ||
            !response.data?.accessToken ||
            !response.data?.user
        ) {
            throw new Error(
                response?.message || "Dữ liệu đăng nhập không hợp lệ."
            );
        }

        saveLoginData(response.data);

        window.location.href = getDefaultRoute(
            response.data.user.roleCode
        );
    } catch (error) {
        console.error("[Login] Đăng nhập thất bại:", error);

        if (elements.loginError) {
            elements.loginError.textContent =
                error.message || "Đăng nhập thất bại.";
        }

        setLoading(false);
    }
}

if (!redirectIfAuthenticated()) {
    elements.form?.addEventListener("submit", handleSubmit);
}
