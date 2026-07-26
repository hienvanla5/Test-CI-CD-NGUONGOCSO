import {
    requireAuth,
    setupLogout
} from "../../core/auth-guard.js";

import {
    getUser
} from "../../core/storage.js";

import {
    getOrganizationProfile,
    updateOrganizationProfile
} from "../../services/organization.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
    throw new Error("User not authenticated.");
}

/*
 * Hồ sơ tổ chức trong khu vực cooperative
 * chỉ dành cho Quản lý hợp tác xã (VT-02).
 */
if (user.roleCode !== "VT-02") {
    window.location.href =
        "/frontend/pages/cooperative/production-lots/index.html";
    throw new Error("Access denied.");
}

const EDIT_ALLOWED_ROLES = ["VT-02"];
const canEdit = EDIT_ALLOWED_ROLES.includes(user.roleCode);

// ---- Profile state ----

let profileData = null;

// ---- DOM references ----

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const mainContent = document.getElementById("mainContent");

// View mode
const viewMode = document.getElementById("viewMode");
const editProfileButton = document.getElementById("editProfileButton");

// View fields
const viewOrgId = document.getElementById("viewOrgId");
const viewOrgName = document.getElementById("viewOrgName");
const viewOrgCode = document.getElementById("viewOrgCode");
const viewOrgType = document.getElementById("viewOrgType");
const viewOrgStatus = document.getElementById("viewOrgStatus");
const viewOrgAddress = document.getElementById("viewOrgAddress");
const viewOrgPhone = document.getElementById("viewOrgPhone");
const viewOrgEmail = document.getElementById("viewOrgEmail");
const viewCreatedAt = document.getElementById("viewCreatedAt");
const viewUpdatedAt = document.getElementById("viewUpdatedAt");

// Header badges
const profileOrgName = document.getElementById("profileOrgName");
const profileOrgCode = document.getElementById("profileOrgCode");
const profileOrgTypeBadge = document.getElementById("profileOrgTypeBadge");
const profileOrgStatusBadge = document.getElementById("profileOrgStatusBadge");

// Edit mode
const editMode = document.getElementById("editMode");
const profileForm = document.getElementById("profileForm");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const editFormMessage = document.getElementById("editFormMessage");

// Edit fields
const editOrgId = document.getElementById("editOrgId");
const editOrgCode = document.getElementById("editOrgCode");
const editOrgType = document.getElementById("editOrgType");
const editOrgStatus = document.getElementById("editOrgStatus");
const editName = document.getElementById("editName");
const editAddress = document.getElementById("editAddress");
const editPhone = document.getElementById("editPhone");
const editEmail = document.getElementById("editEmail");
const editCreatedAt = document.getElementById("editCreatedAt");
const editUpdatedAt = document.getElementById("editUpdatedAt");

// Field errors
const editNameError = document.getElementById("editNameError");
const editAddressError = document.getElementById("editAddressError");
const editPhoneError = document.getElementById("editPhoneError");
const editEmailError = document.getElementById("editEmailError");

// ---- Populate user info ----

function populateUserInfo() {
    var sidebarName = document.getElementById("sidebarUserName");
    var sidebarOrg = document.getElementById("sidebarUserOrg");
    var sidebarAvatar = document.getElementById("sidebarUserAvatar");

    if (sidebarName) sidebarName.textContent = user.fullName || user.username || "—";
    if (sidebarOrg) sidebarOrg.textContent = user.organizationName || "—";
    if (sidebarAvatar) sidebarAvatar.textContent = (user.fullName || user.username || "?")[0].toUpperCase();

    var headerName = document.getElementById("headerUserName");
    var headerOrg = document.getElementById("headerUserOrg");
    var headerRole = document.getElementById("headerUserRole");

    if (headerName) headerName.textContent = user.fullName || user.username || "—";
    if (headerOrg) headerOrg.textContent = user.organizationName || "—";
    if (headerRole) headerRole.textContent = user.roleCode || "—";
}

populateUserInfo();

// ---- Format helpers ----

function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        var date = new Date(dateStr);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch (e) {
        return dateStr;
    }
}

function getTypeDisplayName(typeValue) {
    var names = {
        "COOPERATIVE": "Cooperative",
        "ENTERPRISE": "Enterprise",
        "GOVERNMENT": "Government",
        "SYSTEM": "System"
    };
    return names[typeValue] || typeValue || "—";
}

function getStatusDisplayName(statusValue) {
    if (statusValue === "ACTIVE") return "Active";
    if (statusValue === "INACTIVE") return "Inactive";
    return statusValue || "—";
}

// ---- Show edit button based on role ----

if (canEdit) {
    editProfileButton.style.display = "inline-flex";
}

// ---- Render profile ----

function renderProfile(data) {
    if (!data) return;

    profileData = data;

    // Header badges
    profileOrgName.textContent = data.name || "—";
    profileOrgCode.textContent = data.code || "—";

    var typeName = getTypeDisplayName(data.type);
    profileOrgTypeBadge.textContent = typeName;
    profileOrgTypeBadge.className = "badge badge-type";

    var statusName = getStatusDisplayName(data.status);
    profileOrgStatusBadge.textContent = statusName;
    profileOrgStatusBadge.className = "badge";
    if (data.status === "ACTIVE") {
        profileOrgStatusBadge.classList.add("badge-status");
    } else {
        profileOrgStatusBadge.classList.add("badge-status-inactive");
    }

    // View mode fields
    viewOrgId.textContent = data.organizationId || "—";
    viewOrgName.textContent = data.name || "—";
    viewOrgCode.textContent = data.code || "—";
    viewOrgType.textContent = typeName;
    viewOrgStatus.textContent = statusName;
    viewOrgAddress.textContent = data.address || "—";
    viewOrgPhone.textContent = data.phone || "—";
    viewOrgEmail.textContent = data.email || "—";
    viewCreatedAt.textContent = formatDate(data.createdAt);
    viewUpdatedAt.textContent = formatDate(data.updatedAt);
}

// ---- Switch to view mode ----

function showViewMode() {
    if (profileData) {
        renderProfile(profileData);
    }

    viewMode.style.display = "block";
    editMode.style.display = "none";

    editProfileButton.style.display = canEdit ? "inline-flex" : "none";

    // Clear form messages
    editFormMessage.textContent = "";
    editFormMessage.className = "form-message";
    clearFieldErrors();
}

// ---- Switch to edit mode ----

function showEditMode() {
    if (!profileData) return;

    // Populate edit form with current data
    editOrgId.value = profileData.organizationId || "—";
    editOrgCode.value = profileData.code || "—";
    editOrgType.value = getTypeDisplayName(profileData.type);
    editOrgStatus.value = getStatusDisplayName(profileData.status);
    editName.value = profileData.name || "";
    editAddress.value = profileData.address || "";
    editPhone.value = profileData.phone || "";
    editEmail.value = profileData.email || "";
    editCreatedAt.value = formatDate(profileData.createdAt);
    editUpdatedAt.value = formatDate(profileData.updatedAt);

    // Clear errors
    editFormMessage.textContent = "";
    editFormMessage.className = "form-message";
    clearFieldErrors();

    viewMode.style.display = "none";
    editMode.style.display = "block";
    editProfileButton.style.display = "none";

    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";
}

// ---- Clear field errors ----

function clearFieldErrors() {
    var errors = [
        editNameError,
        editAddressError,
        editPhoneError,
        editEmailError
    ];
    errors.forEach(function (el) {
        if (el) el.textContent = "";
    });

    var inputs = [
        editName, editAddress, editPhone, editEmail
    ];
    inputs.forEach(function (input) {
        if (input) {
            input.classList.remove("input-error");
            input.setAttribute("aria-invalid", "false");
        }
    });
}

// ---- Show field errors ----

function showFieldErrors(errors) {
    clearFieldErrors();

    Object.entries(errors).forEach(function ([fieldName, message]) {
        var errorEl = null;
        var inputEl = null;

        switch (fieldName) {
            case "name":
                errorEl = editNameError;
                inputEl = editName;
                break;
            case "address":
                errorEl = editAddressError;
                inputEl = editAddress;
                break;
            case "phone":
                errorEl = editPhoneError;
                inputEl = editPhone;
                break;
            case "email":
                errorEl = editEmailError;
                inputEl = editEmail;
                break;
        }

        if (errorEl) errorEl.textContent = message;
        if (inputEl) {
            inputEl.classList.add("input-error");
            inputEl.setAttribute("aria-invalid", "true");
        }
    });

    // Focus first error field
    var firstField = Object.keys(errors)[0];
    var firstInput = null;
    switch (firstField) {
        case "name":
            firstInput = editName;
            break;
        case "address":
            firstInput = editAddress;
            break;
        case "phone":
            firstInput = editPhone;
            break;
        case "email":
            firstInput = editEmail;
            break;
    }
    if (firstInput) firstInput.focus();
}

// ---- Client-side validation ----

function validateProfileForm() {
    var errors = {};

    var name = (editName.value || "").trim();
    var address = (editAddress.value || "").trim();
    var phone = (editPhone.value || "").trim();
    var email = (editEmail.value || "").trim();

    // Name is required
    if (!name) {
        errors.name = "Organization name is required.";
    }

    // Phone validation (optional, but if provided must be 10-11 digits)
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
        errors.phone = "Phone number must contain 10-11 digits.";
    }

    // Email validation (optional, but if provided must be valid)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address.";
    }

    return {
        errors: errors,
        data: {
            name: name,
            address: address || undefined,
            phone: phone || undefined,
            email: email || undefined
        }
    };
}

// ---- Load profile ----

async function loadProfile() {
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    mainContent.style.display = "none";

    try {
        var response = await getOrganizationProfile();

        if (!response.success) {
            throw new Error(response.message || "Failed to load organization profile.");
        }

        var data = response.data;

        if (!data) {
            throw new Error("Organization profile not found.");
        }

        loadingState.style.display = "none";
        mainContent.style.display = "block";

        renderProfile(data);
        showViewMode();

    } catch (error) {
        console.error("Load profile error:", error);

        loadingState.style.display = "none";
        mainContent.style.display = "none";

        var msg = error.message || "An unexpected error occurred while loading the profile.";

        // Handle 404 specifically
        if (msg.indexOf("404") !== -1 || msg.toLowerCase().indexOf("not found") !== -1) {
            msg = "Organization profile not found.";
        }

        errorMessage.textContent = msg;
        errorState.style.display = "flex";
    }
}

// ---- Save profile ----

async function handleSave(event) {
    event.preventDefault();

    var validation = validateProfileForm();

    if (Object.keys(validation.errors).length > 0) {
        showFieldErrors(validation.errors);
        return;
    }

    // Disable button and prevent duplicate submission
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    editFormMessage.textContent = "";
    editFormMessage.className = "form-message";

    try {
        var response = await updateOrganizationProfile(validation.data);

        if (!response.success) {
            throw new Error(response.message || "Failed to update organization profile.");
        }

        // Update profile data with response
        var updatedData = response.data;
        if (updatedData) {
            profileData = updatedData;
        }

        editFormMessage.textContent = "Organization profile updated successfully.";
        editFormMessage.className = "form-message success";

        // Return to view mode after short delay
        setTimeout(function () {
            showViewMode();
        }, 1000);

    } catch (error) {
        console.error("Save profile error:", error);

        var msg = error.message || "Unable to update organization profile. Please try again later.";

        // Handle specific error codes
        if (msg.indexOf("401") !== -1) {
            // Already handled by api-client
            return;
        }

        if (msg.indexOf("403") !== -1) {
            msg = "You do not have permission to edit this organization profile.";
        }

        if (msg.indexOf("500") !== -1) {
            msg = "Unable to update organization profile. Please try again later.";
        }

        editFormMessage.textContent = msg;
        editFormMessage.className = "form-message error";
        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";
    }
}

// ---- Event listeners ----

editProfileButton.addEventListener("click", showEditMode);

cancelButton.addEventListener("click", function () {
    showViewMode();
});

profileForm.addEventListener("submit", handleSave);

retryButton.addEventListener("click", function () {
    loadProfile();
});

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadProfile();
