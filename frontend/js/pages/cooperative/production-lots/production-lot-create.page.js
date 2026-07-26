import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    createProductionLot,
    getFarmAreas,
    getProductCategories
} from "../../../services/production-lot.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
}

const roleCode = user.roleCode;

const allowedRoles = ["VT-01", "VT-02", "VT-03"];

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

// Success elements
const successMessage = document.getElementById("successMessage");
const successDetails = document.getElementById("successDetails");
const successName = document.getElementById("successName");
const successFarmArea = document.getElementById("successFarmArea");
const successCategory = document.getElementById("successCategory");
const successQuantity = document.getElementById("successQuantity");
const successStatus = document.getElementById("successStatus");
const backToListButton = document.getElementById("backToListButton");
const createAnotherButton = document.getElementById("createAnotherButton");

// Form
const form = document.getElementById("productionLotForm");
const nameInput = document.getElementById("name");
const farmAreaSelect = document.getElementById("farmAreaId");
const productCategorySelect = document.getElementById("productCategoryId");
const expectedQuantityInput = document.getElementById("expectedQuantity");
const plantingDateInput = document.getElementById("plantingDate");

// Form actions container
const formActions = document.getElementById("formActions");

// Field error elements
const nameError = document.getElementById("nameError");
const farmAreaIdError = document.getElementById("farmAreaIdError");
const productCategoryIdError = document.getElementById("productCategoryIdError");
const expectedQuantityError = document.getElementById("expectedQuantityError");
const plantingDateError = document.getElementById("plantingDateError");

// Buttons
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

// ---- State ----

let farmAreasCache = [];
let productCategoriesCache = [];
let farmAreasLoaded = false;
let productCategoriesLoaded = false;
let isLoadingData = false;

// ---- Show form state ----

function showForm() {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    mainContent.style.display = "block";
}

function showLoading() {
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    mainContent.style.display = "none";
}

function showLoadError(message) {
    loadingState.style.display = "none";
    mainContent.style.display = "none";

    if (errorMessage) {
        errorMessage.textContent = message || "An error occurred while loading data.";
    }
    errorState.style.display = "flex";
}

// ---- Load farm areas ----

async function loadFarmAreas() {
    try {
        const response = await getFarmAreas();

        if (!response.success) {
            console.warn("Failed to load farm areas:", response.message);
            farmAreaSelect.innerHTML = '<option value="">Failed to load farm areas</option>';
            farmAreaSelect.disabled = true;
            return;
        }

        farmAreasCache = response.data || [];

        populateFarmAreaSelect(farmAreasCache);
        farmAreasLoaded = true;

    } catch (error) {
        console.error("Load farm areas error:", error);

        farmAreaSelect.innerHTML = '<option value="">Failed to load farm areas</option>';
        farmAreaSelect.disabled = true;
    }
}

function populateFarmAreaSelect(farmAreas) {
    farmAreaSelect.innerHTML = '<option value="">Select farm area</option>';

    if (!farmAreas || farmAreas.length === 0) {
        var emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent = "No farm areas available";
        farmAreaSelect.appendChild(emptyOption);
        farmAreaSelect.disabled = true;
        return;
    }

    farmAreas.forEach(function (area) {
        var option = document.createElement("option");
        // The backend FarmAreaResponse returns { id: UUID, name: String }
        option.value = area.id;
        option.textContent = area.name;
        farmAreaSelect.appendChild(option);
    });

    farmAreaSelect.disabled = false;
}

// ---- Load product categories ----

async function loadProductCategories() {
    try {
        const response = await getProductCategories();

        if (!response.success) {
            console.warn("Failed to load product categories:", response.message);
            productCategorySelect.innerHTML = '<option value="">Failed to load product categories</option>';
            productCategorySelect.disabled = true;
            return;
        }

        productCategoriesCache = response.data || [];

        populateProductCategorySelect(productCategoriesCache);
        productCategoriesLoaded = true;

    } catch (error) {
        console.error("Load product categories error:", error);

        productCategorySelect.innerHTML = '<option value="">Failed to load product categories</option>';
        productCategorySelect.disabled = true;
    }
}

function populateProductCategorySelect(categories) {
    productCategorySelect.innerHTML = '<option value="">Select product category</option>';

    if (!categories || categories.length === 0) {
        var emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent = "No product categories available";
        productCategorySelect.appendChild(emptyOption);
        productCategorySelect.disabled = true;
        return;
    }

    categories.forEach(function (cat) {
        var option = document.createElement("option");
        // The backend ProductCategoryResponse returns { id: UUID, name: String }
        option.value = cat.id;
        option.textContent = cat.name;
        productCategorySelect.appendChild(option);
    });

    productCategorySelect.disabled = false;
}

// ---- Initial data loading ----

async function loadInitialData() {
    isLoadingData = true;
    showLoading();

    try {
        // Load farm areas and product categories in parallel
        await Promise.all([
            loadFarmAreas(),
            loadProductCategories()
        ]);

        // Check if at least product categories loaded successfully
        // (Farm areas may not have a GET endpoint yet)
        if (!productCategoriesLoaded && farmAreasLoaded === false) {
            showLoadError("Failed to load required data. Please try again.");
            isLoadingData = false;
            return;
        }

        showForm();
        isLoadingData = false;

    } catch (error) {
        console.error("Initial load error:", error);
        showLoadError(error.message || "An unexpected error occurred while loading data.");
        isLoadingData = false;
    }
}

// ---- Reset form to initial state ----

function resetForm() {
    form.reset();
    clearFieldErrors();
    formMessage.textContent = "";
    formMessage.className = "form-message";
    formMessage.style.display = "block";
    successMessage.style.display = "none";
    successDetails.style.display = "none";
    formActions.style.display = "flex";
    submitButton.disabled = false;
    submitButton.textContent = "Create Production Lot";
    submitButton.style.display = "inline-flex";
    nameInput.focus();
}

// ---- Show success state ----

function showSuccessState(responseData) {
    // Hide form elements
    formActions.style.display = "none";
    submitButton.style.display = "none";
    formMessage.style.display = "none";

    // Display success message
    successMessage.textContent = "Production lot created successfully!";
    successMessage.className = "form-message success";
    successMessage.style.display = "block";

    // Populate success details
    if (responseData) {
        successName.textContent = responseData.name || "—";
        successFarmArea.textContent = responseData.farmAreaName || "—";
        successCategory.textContent = responseData.productCategoryName || "—";
        successQuantity.textContent = responseData.expectedQuantity != null ? responseData.expectedQuantity : "—";
        successStatus.textContent = responseData.status || "—";
    }

    successDetails.style.display = "block";
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
    var farmAreaValue = farmAreaSelect.value;
    var categoryValue = productCategorySelect.value;
    var quantityValue = expectedQuantityInput.value;

    // Name
    if (!trimmedName) {
        errors.name = "Production lot name is required.";
    } else if (trimmedName.length > 255) {
        errors.name = "Production lot name must not exceed 255 characters.";
    }

    // Farm area
    if (!farmAreaValue) {
        errors.farmAreaId = "Please select a farm area.";
    }

    // Product category
    if (!categoryValue) {
        errors.productCategoryId = "Please select a product category.";
    }

    // Expected quantity
    if (!quantityValue) {
        errors.expectedQuantity = "Expected quantity is required.";
    } else {
        var quantityNum = parseFloat(quantityValue);
        if (isNaN(quantityNum)) {
            errors.expectedQuantity = "Expected quantity must be a valid number.";
        } else if (quantityNum <= 0) {
            errors.expectedQuantity = "Expected quantity must be greater than 0.";
        }
    }

    // Show field errors
    if (errors.name) showFieldError("name", "nameError", errors.name);
    if (errors.farmAreaId) showFieldError("farmAreaId", "farmAreaIdError", errors.farmAreaId);
    if (errors.productCategoryId) showFieldError("productCategoryId", "productCategoryIdError", errors.productCategoryId);
    if (errors.expectedQuantity) showFieldError("expectedQuantity", "expectedQuantityError", errors.expectedQuantity);

    return Object.keys(errors).length === 0;
}

// ---- Form submission ----

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous messages
    if (formMessage) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
        formMessage.style.display = "block";
    }

    // Hide success state if visible
    successMessage.style.display = "none";
    successDetails.style.display = "none";

    // Validate
    if (!validateForm()) {
        return;
    }

    // Disable submit button - prevent duplicate submissions
    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    // Build request body matching CreateProductionLotRequest DTO exactly
    var quantityNum = parseFloat(expectedQuantityInput.value);
    var plantingDateValue = plantingDateInput.value || null;

    var requestBody = {
        name: (nameInput.value || "").trim(),
        farmAreaId: farmAreaSelect.value || null,
        productCategoryId: productCategorySelect.value,
        expectedQuantity: quantityNum,
        plantingDate: plantingDateValue
    };

    // Do NOT send: description, lotCode, status, farmCode

    try {
        const response = await createProductionLot(requestBody);

        if (!response.success) {
            throw new Error(response.message || "Failed to create production lot.");
        }

        // Success
        var responseData = response.data;

        if (formMessage) {
            formMessage.style.display = "none";
        }

        showSuccessState(responseData);

    } catch (error) {
        console.error("Create production lot error:", error);

        var message = error.message || "An unexpected error occurred.";

        // Handle 403 Forbidden
        if (typeof message === "string" && message.indexOf("403") !== -1) {
            message = "You do not have permission to create a production lot.";
        }

        // Handle 500 Server Error
        if (typeof message === "string" && message.indexOf("500") !== -1) {
            message = "Unable to create production lot. Please try again later.";
        }

        // Try to map backend validation errors to fields
        if (typeof message === "string") {
            var msgLower = message.toLowerCase();

            // Backend messages are in Vietnamese
            if (msgLower.indexOf("tên") !== -1 || msgLower.indexOf("name") !== -1) {
                showFieldError("name", "nameError", message);
                message = "";
            }

            if (msgLower.indexOf("vùng") !== -1 || msgLower.indexOf("farm") !== -1 || msgLower.indexOf("khu vực") !== -1) {
                showFieldError("farmAreaId", "farmAreaIdError", message);
                message = "";
            }

            if (msgLower.indexOf("nông sản") !== -1 || msgLower.indexOf("category") !== -1 || msgLower.indexOf("product") !== -1) {
                showFieldError("productCategoryId", "productCategoryIdError", message);
                message = "";
            }

            if (msgLower.indexOf("sản lượng") !== -1 || msgLower.indexOf("quantity") !== -1) {
                showFieldError("expectedQuantity", "expectedQuantityError", message);
                message = "";
            }
        }

        if (message) {
            if (formMessage) {
                formMessage.textContent = message;
                formMessage.className = "form-message error";
                formMessage.style.display = "block";
            }
        }

        submitButton.disabled = false;
        submitButton.textContent = "Create Production Lot";
    }
});

// ---- Cancel button ----

if (cancelButton) {
    cancelButton.addEventListener("click", function () {
        window.location.href = "/frontend/pages/cooperative/production-lots/index.html";
    });
}

// ---- Success navigation buttons ----

if (backToListButton) {
    backToListButton.addEventListener("click", function () {
        window.location.href = "/frontend/pages/cooperative/production-lots/index.html";
    });
}

if (createAnotherButton) {
    createAnotherButton.addEventListener("click", function () {
        resetForm();
    });
}

// ---- Retry ----

if (retryButton) {
    retryButton.addEventListener("click", function () {
        loadInitialData();
    });
}

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadInitialData();