import {
    requireAuth,
    setupLogout
} from "../../core/auth-guard.js";

import {
    getUser
} from "../../core/storage.js";

import {
    createFarmArea,
    getProductCategories
} from "../../services/farm-area.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
}

const roleCode = user.roleCode;

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
const formMessage = document.getElementById("formMessage");

// Form fields
const form = document.getElementById("farmAreaForm");
const nameInput = document.getElementById("name");
const cropTypeSelect = document.getElementById("cropType");
const areaInput = document.getElementById("area");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

// Field error elements
const nameError = document.getElementById("nameError");
const cropTypeError = document.getElementById("cropTypeError");
const areaError = document.getElementById("areaError");
const latitudeError = document.getElementById("latitudeError");
const longitudeError = document.getElementById("longitudeError");

// Buttons
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

// ---- Load crop types ----

let cropTypesCache = [];
let cropTypesLoaded = false;

async function loadCropTypes() {
    try {
        const response = await getProductCategories();

        if (!response.success) {
            throw new Error(response.message || "Failed to load crop types.");
        }

        cropTypesCache = response.data || [];

        populateCropTypeSelect(cropTypesCache);
        cropTypesLoaded = true;

    } catch (error) {
        console.error("Load crop types error:", error);

        // Show error in select if categories failed to load
        cropTypeSelect.innerHTML = '<option value="">Failed to load crop types</option>';
        cropTypeSelect.disabled = true;

        // Show error message
        if (formMessage) {
            formMessage.textContent = error.message || "Could not load crop types.";
            formMessage.className = "form-message error";
        }
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

    cropTypes.forEach(function (cat) {
        var option = document.createElement("option");
        // The backend ProductCategoryResponse returns { id: UUID, name: String }
        option.value = cat.id;
        option.textContent = cat.name;
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
    var areaValue = areaInput.value;
    var latValue = latitudeInput.value;
    var lngValue = longitudeInput.value;

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

    // Area
    if (!areaValue) {
        errors.area = "Area is required.";
    } else {
        var areaNum = parseFloat(areaValue);
        if (isNaN(areaNum) || areaNum < 0.01) {
            errors.area = "Area must be at least 0.01.";
        }
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

    // Show field errors
    if (errors.name) showFieldError("name", "nameError", errors.name);
    if (errors.cropType) showFieldError("cropType", "cropTypeError", errors.cropType);
    if (errors.area) showFieldError("area", "areaError", errors.area);
    if (errors.latitude) showFieldError("latitude", "latitudeError", errors.latitude);
    if (errors.longitude) showFieldError("longitude", "longitudeError", errors.longitude);

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

        // Redirect to farm areas index page after short delay
        setTimeout(function () {
            window.location.href = "/frontend/pages/cooperative/farm-areas/index.html";
        }, 1500);

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

            if (msgLower.indexOf("diện tích") !== -1 || msgLower.indexOf("area") !== -1) {
                showFieldError("area", "areaError", message);
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

// ---- Cancel button ----

if (cancelButton) {
    cancelButton.addEventListener("click", function () {
        window.location.href = "/frontend/pages/cooperative/farm-areas/index.html";
    });
}

// ---- Retry ----

if (retryButton) {
    retryButton.addEventListener("click", function () {
        loadCropTypes();
    });
}

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadCropTypes();