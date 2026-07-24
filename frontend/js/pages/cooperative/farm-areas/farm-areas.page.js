import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    createFarmArea,
    getProductCategories
} from "../../../services/farm-area.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
}

const roleCode = user.roleCode;

const canManageFarmAreas =
    user.roleCode === "VT-02";
    
const allowedRoles = ["VT-02"];

if (!allowedRoles.includes(roleCode)) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("unauthorizedState").style.display = "flex";
    document.getElementById("mainContent").style.display = "none";
    throw new Error("Access denied: user does not have permission to access this page.");
}

// ---- Populate user info ----

function populateUserInfo() {
    // Sidebar
    var sidebarName = document.getElementById("sidebarUserName");
    var sidebarOrg = document.getElementById("sidebarUserOrg");
    var sidebarAvatar = document.getElementById("sidebarUserAvatar");

    if (sidebarName) sidebarName.textContent = user.fullName || user.username || "—";
    if (sidebarOrg) sidebarOrg.textContent = user.organizationName || "—";
    if (sidebarAvatar) sidebarAvatar.textContent = (user.fullName || user.username || "?")[0].toUpperCase();

    // Header
    var headerName = document.getElementById("headerUserName");
    var headerOrg = document.getElementById("headerUserOrg");
    var headerRole = document.getElementById("headerUserRole");

    if (headerName) headerName.textContent = user.fullName || user.username || "—";
    if (headerOrg) headerOrg.textContent = user.organizationName || "—";
    if (headerRole) headerRole.textContent = user.roleCode || "—";
}

populateUserInfo();

// ---- DOM references ----

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const unauthorizedState = document.getElementById("unauthorizedState");
const mainContent = document.getElementById("mainContent");

// Create form
const form = document.getElementById("farmAreaForm");
const nameInput = document.getElementById("name");
const cropTypeSelect = document.getElementById("cropType");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const areaInput = document.getElementById("area");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");

// Field error elements
const nameError = document.getElementById("nameError");
const cropTypeError = document.getElementById("cropTypeError");
const latitudeError = document.getElementById("latitudeError");
const longitudeError = document.getElementById("longitudeError");
const areaError = document.getElementById("areaError");

// ---- State ----

let cropTypesCache = [];

// ---- Load crop types ----

async function loadCropTypes() {
    try {
        const response = await getProductCategories();

        if (!response.success) {
            console.warn("Failed to load crop types:", response.message);
            return;
        }

        cropTypesCache = response.data || [];

        populateCropTypeSelect(cropTypesCache);

    } catch (error) {
        console.error("Load crop types error:", error);

        cropTypeSelect.innerHTML = '<option value="">Failed to load crop types</option>';
        cropTypeSelect.disabled = true;
    }
}

function populateCropTypeSelect(cropTypes) {
    cropTypeSelect.innerHTML = '<option value="">Select crop type</option>';

    if (!cropTypes || cropTypes.length === 0) {
        var emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent = "No crop types available";
        cropTypeSelect.appendChild(emptyOption);
        return;
    }

    cropTypes.forEach(function (cropType) {
        var option = document.createElement("option");
        // The backend ProductCategoryResponse has UUID id
        option.value = cropType.id;
        option.textContent = cropType.name;
        cropTypeSelect.appendChild(option);
    });
}

// ---- Field-level validation ----

function clearFieldErrors() {
    var errorEls = document.querySelectorAll(".field-error");
    errorEls.forEach(function (el) {
        el.textContent = "";
    });

    var errorInputs = document.querySelectorAll(".input-error");
    errorInputs.forEach(function (input) {
        input.classList.remove("input-error");
        input.setAttribute("aria-invalid", "false");
    });
}

function showFieldError(inputId, errorElId, message) {
    var errorEl = document.getElementById(errorElId);
    var inputEl = document.getElementById(inputId);

    if (errorEl) {
        errorEl.textContent = message;
    }

    if (inputEl) {
        inputEl.classList.add("input-error");
        inputEl.setAttribute("aria-invalid", "true");
    }
}

function validateForm() {
    clearFieldErrors();

    var errors = {};
    var trimmedName = (nameInput.value || "").trim();
    var cropTypeValue = cropTypeSelect.value;
    var latValue = latitudeInput.value;
    var lngValue = longitudeInput.value;
    var areaValue = areaInput.value;

    // Name
    if (!trimmedName) {
        errors.name = "Farm area name is required.";
    } else if (trimmedName.length > 255) {
        errors.name = "Farm area name must not exceed 255 characters.";
    }

    // Crop type
    if (!cropTypeValue) {
        errors.cropType = "Crop type is required.";
    }

    // Latitude
    if (!latValue) {
        errors.latitude = "Latitude is required.";
    } else {
        var latNum = parseFloat(latValue);
        if (isNaN(latNum)) {
            errors.latitude = "Latitude must be a valid number.";
        }
    }

    // Longitude
    if (!lngValue) {
        errors.longitude = "Longitude is required.";
    } else {
        var lngNum = parseFloat(lngValue);
        if (isNaN(lngNum)) {
            errors.longitude = "Longitude must be a valid number.";
        }
    }

    // Area
    if (!areaValue) {
        errors.area = "Area is required.";
    } else {
        var areaNum = parseFloat(areaValue);
        if (isNaN(areaNum)) {
            errors.area = "Area must be a valid number.";
        } else if (areaNum < 0.01) {
            errors.area = "Area must be at least 0.01.";
        }
    }

    // Show field errors
    if (errors.name) showFieldError("name", "nameError", errors.name);
    if (errors.cropType) showFieldError("cropType", "cropTypeError", errors.cropType);
    if (errors.latitude) showFieldError("latitude", "latitudeError", errors.latitude);
    if (errors.longitude) showFieldError("longitude", "longitudeError", errors.longitude);
    if (errors.area) showFieldError("area", "areaError", errors.area);

    return Object.keys(errors).length === 0;
}

// ---- Form submission ----

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous messages
    if (formMessage) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
    }

    // Validate
    if (!validateForm()) {
        return;
    }

    // Disable submit button - prevent duplicate submissions
    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    // Build request body matching CreateFarmAreaRequest DTO exactly
    var areaNum = parseFloat(areaInput.value);
    var latNum = parseFloat(latitudeInput.value);
    var lngNum = parseFloat(longitudeInput.value);

    var requestBody = {
        name: (nameInput.value || "").trim(),
        cropType: cropTypeSelect.value,
        latitude: latNum,
        longitude: lngNum,
        area: areaNum
    };

    // Do NOT send: farmCode, productCategoryId, provinceCode, districtCode, wardCode, addressDetail

    try {
        const response = await createFarmArea(requestBody);

        if (!response.success) {
            throw new Error(response.message || "Failed to create farm area.");
        }

        // Success
        if (formMessage) {
            formMessage.textContent = "Farm area created successfully.";
            formMessage.className = "form-message success";
        }

        // Reset form after successful creation
        form.reset();
        clearFieldErrors();

        // Re-enable submit after success
        submitButton.disabled = false;
        submitButton.textContent = "Create Farm Area";

    } catch (error) {
        console.error("Create farm area error:", error);

        var message = error.message || "An unexpected error occurred.";

        // Handle 403 Forbidden
        if (typeof message === "string" && message.indexOf("403") !== -1) {
            message = "You do not have permission to create a farm area.";
        }

        // Handle 500 Server Error
        if (typeof message === "string" && message.indexOf("500") !== -1) {
            message = "Unable to create farm area. Please try again later.";
        }

        // Try to map backend validation errors to fields
        if (typeof message === "string") {
            var msgLower = message.toLowerCase();

            // Backend messages are in Vietnamese
            if (msgLower.indexOf("tên") !== -1 || msgLower.indexOf("name") !== -1) {
                showFieldError("name", "nameError", message);
                message = "";
            }

            if (msgLower.indexOf("cây trồng") !== -1 || msgLower.indexOf("crop") !== -1) {
                showFieldError("cropType", "cropTypeError", message);
                message = "";
            }

            if (msgLower.indexOf("vĩ độ") !== -1 || msgLower.indexOf("latitude") !== -1) {
                showFieldError("latitude", "latitudeError", message);
                message = "";
            }

            if (msgLower.indexOf("kinh độ") !== -1 || msgLower.indexOf("longitude") !== -1) {
                showFieldError("longitude", "longitudeError", message);
                message = "";
            }

            if (msgLower.indexOf("diện tích") !== -1 || msgLower.indexOf("area") !== -1) {
                showFieldError("area", "areaError", message);
                message = "";
            }
        }

        if (message) {
            if (formMessage) {
                formMessage.textContent = message;
                formMessage.className = "form-message error";
            }
        }

        submitButton.disabled = false;
        submitButton.textContent = "Create Farm Area";
    }
});

// ---- Retry ----

if (retryButton) {
    retryButton.addEventListener("click", function () {
        loadCropTypes();
    });
}

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----
// Hide loading state and show main content immediately
if (loadingState) {
    loadingState.style.display = "none";
}
if (mainContent) {
    mainContent.style.display = "block";
}

loadCropTypes();