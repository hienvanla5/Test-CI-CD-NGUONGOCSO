import {
    createOrganization
} from "../../services/organization.service.js";

import {
    requireAuth,
    setupLogout
} from "../../core/auth-guard.js";

import {
    getUser
} from "../../core/storage.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
}

const roleCode = user.roleCode;

const allowedRoles = ["VT-01"];

if (!allowedRoles.includes(roleCode)) {
    const app = document.getElementById("app") || document.body;
    app.innerHTML = `
        <main class="organization-page">
            <section class="organization-card" style="text-align:center;padding:80px 40px;">
                <h1 style="color:var(--color-danger);margin-bottom:16px;">Access Denied</h1>
                <p style="color:var(--color-text-muted);font-size:1.1rem;">
                    You do not have permission to create organizations.
                </p>
                <a href="/frontend/pages/admin/dashboard.html"
                   class="btn btn-primary"
                   style="display:inline-block;margin-top:24px;padding:12px 32px;border-radius:var(--border-radius-sm);text-decoration:none;">
                    Back to Dashboard
                </a>
            </section>
        </main>
    `;
    throw new Error("Access denied: user does not have permission to create organizations.");
}

// ---- DOM references ----

const organizationForm = document.getElementById("organizationForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

// ---- Form submit ----

organizationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage();
    clearFieldErrors();

    const formData = new FormData(organizationForm);

    const organizationData = {
        organizationName: getFormValue(formData, "organizationName"),
        organizationCode: getFormValue(formData, "organizationCode").toUpperCase(),
        organizationType: getFormValue(formData, "organizationType"),
        address: getFormValue(formData, "address"),
        phone: getFormValue(formData, "phone"),
        email: getFormValue(formData, "email"),
        fullName: getFormValue(formData, "fullName"),
        userName: getFormValue(formData, "userName"),
        password: formData.get("password"),
        managerPhone: getFormValue(formData, "managerPhone"),
        managerEmail: getFormValue(formData, "managerEmail")
    };

    const errors = validateOrganization(organizationData);

    if (Object.keys(errors).length > 0) {
        showFieldErrors(errors);
        return;
    }

    setLoading(true);

    try {
        const response = await createOrganization(organizationData);

        // Redirect to admin dashboard after successful creation
        window.location.href = "../dashboard.html";

    } catch (error) {
        console.error("Create organization error:", error);

        const message = error.message || "An unexpected error occurred.";

        // Try to parse field-specific errors from backend message
        if (message.toLowerCase().includes("code") && message.toLowerCase().includes("exist")) {
            const codeErrorEl = document.querySelector('[data-error-for="organizationCode"]');
            if (codeErrorEl) {
                codeErrorEl.textContent = "Organization code already exists.";
                document.querySelector('[name="organizationCode"]').classList.add("input-error");
            }
        }

        if (message.toLowerCase().includes("email") && message.toLowerCase().includes("exist")) {
            const emailErrorEl = document.querySelector('[data-error-for="managerEmail"]');
            if (emailErrorEl) {
                emailErrorEl.textContent = "Manager email is already in use.";
                document.querySelector('[name="managerEmail"]').classList.add("input-error");
            }
        }

        if (message.toLowerCase().includes("username") && message.toLowerCase().includes("exist")) {
            const usernameErrorEl = document.querySelector('[data-error-for="userName"]');
            if (usernameErrorEl) {
                usernameErrorEl.textContent = "Username already exists.";
                document.querySelector('[name="userName"]').classList.add("input-error");
            }
        }

        // Map backend validation messages to fields
        if (message.toLowerCase().includes("tên tổ chức") || message.toLowerCase().includes("organization name")) {
            const el = document.querySelector('[data-error-for="organizationName"]');
            if (el) {
                el.textContent = message;
                document.querySelector('[name="organizationName"]').classList.add("input-error");
            }
        }

        if (message.toLowerCase().includes("mã tổ chức") || message.toLowerCase().includes("mã tổ chức chỉ được")) {
            const el = document.querySelector('[data-error-for="organizationCode"]');
            if (el) {
                el.textContent = message;
                document.querySelector('[name="organizationCode"]').classList.add("input-error");
            }
        }

        if (message.toLowerCase().includes("mật khẩu")) {
            const el = document.querySelector('[data-error-for="password"]');
            if (el) {
                el.textContent = message;
                document.querySelector('[name="password"]').classList.add("input-error");
            }
        }

        if (message.toLowerCase().includes("tên đăng nhập")) {
            const el = document.querySelector('[data-error-for="userName"]');
            if (el) {
                el.textContent = message;
                document.querySelector('[name="userName"]').classList.add("input-error");
            }
        }

        showError(message);

    } finally {
        setLoading(false);
    }
});

// ---- Cancel ----

cancelButton.addEventListener("click", function () {
    window.location.href = "../dashboard.html";
});

// ---- Setup logout ----

setupLogout();

// ---- Helper functions ----

function getFormValue(formData, fieldName) {
    const value = formData.get(fieldName);
    return value ? value.trim() : "";
}

function validateOrganization(data) {
    const errors = {};

    // organizationName
    if (!data.organizationName) {
        errors.organizationName = "Organization name is required.";
    } else if (data.organizationName.length > 255) {
        errors.organizationName = "Organization name must not exceed 255 characters.";
    }

    // organizationCode
    if (!data.organizationCode) {
        errors.organizationCode = "Organization code is required.";
    } else if (!/^[A-Z0-9_-]+$/.test(data.organizationCode)) {
        errors.organizationCode = "Only uppercase letters, numbers, hyphens, and underscores are allowed.";
    }

    // organizationType
    const validOrganizationTypes = [
        "COOPERATIVE",
        "ENTERPRISE",
        "GOVERNMENT"
    ];

    if (!data.organizationType) {
        errors.organizationType = "Organization type is required.";
    } else if (!validOrganizationTypes.includes(data.organizationType)) {
        errors.organizationType = "Invalid organization type.";
    }

    // address (optional)
    if (data.address && data.address.length > 255) {
        errors.address = "Address must not exceed 255 characters.";
    }

    // phone (optional)
    if (data.phone && !isValidVietnamesePhone(data.phone)) {
        errors.phone = "Please enter a valid Vietnamese phone number (e.g., 0912345678).";
    }

    // email (optional)
    if (data.email && !isValidEmail(data.email)) {
        errors.email = "Please enter a valid email address.";
    }

    // fullName
    if (!data.fullName) {
        errors.fullName = "Manager full name is required.";
    } else if (data.fullName.length > 100) {
        errors.fullName = "Full name must not exceed 100 characters.";
    }

    // userName
    if (!data.userName) {
        errors.userName = "Username is required.";
    } else if (!/^[a-zA-Z0-9._-]{4,30}$/.test(data.userName)) {
        errors.userName = "Username must be 4-30 characters: letters, numbers, dots, underscores or hyphens.";
    }

    // managerEmail
    if (!data.managerEmail) {
        errors.managerEmail = "Manager email is required.";
    } else if (!isValidEmail(data.managerEmail)) {
        errors.managerEmail = "Please enter a valid email address.";
    }

    // password
    if (!data.password) {
        errors.password = "Password is required.";
    } else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    } else if (data.password.length > 50) {
        errors.password = "Password must not exceed 50 characters.";
    } else if (!validatePassword(data.password)) {
        errors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!).";
    }

    // managerPhone (optional)
    if (data.managerPhone && !isValidVietnamesePhone(data.managerPhone)) {
        errors.managerPhone = "Please enter a valid Vietnamese phone number (e.g., 0912345678).";
    }

    return errors;
}

function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).+$/.test(password);
}

function isValidVietnamesePhone(phone) {
    return /^(0|\+84)[1-9][0-9]{8}$/.test(phone);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldErrors(errors) {
    Object.entries(errors).forEach(function ([fieldName, message]) {
        const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
        const inputElement = document.querySelector(`[name="${fieldName}"]`);

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (inputElement) {
            inputElement.classList.add("input-error");
            inputElement.setAttribute("aria-invalid", "true");
        }
    });

    const firstErrorField = Object.keys(errors)[0];
    const firstInput = document.querySelector(`[name="${firstErrorField}"]`);

    if (firstInput) {
        firstInput.focus();
    }
}

function clearFieldErrors() {
    const errorElements = document.querySelectorAll(".field-error");
    errorElements.forEach(function (element) {
        element.textContent = "";
    });

    const errorInputs = document.querySelectorAll(".input-error");
    errorInputs.forEach(function (input) {
        input.classList.remove("input-error");
        input.setAttribute("aria-invalid", "false");
    });
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading
        ? "Creating..."
        : "Create Organization";
}

function showSuccess(message) {
    formMessage.textContent = message;
    formMessage.className = "form-message success";
}

function showError(message) {
    formMessage.textContent = message;
    formMessage.className = "form-message error";
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}