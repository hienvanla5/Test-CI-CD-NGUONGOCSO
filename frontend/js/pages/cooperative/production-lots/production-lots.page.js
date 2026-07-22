import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    getProductionLots
} from "../../../services/production-lot.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

function setupSidebarByRole() {
    if (!user || user.roleCode !== "VT-03") {
        return;
    }

    const menuIds = [
        "dashboardMenu",
        "farmAreasMenu",
        "organizationProfileMenu"
    ];

    menuIds.forEach(function (menuId) {
        const menuItem =
            document.getElementById(menuId);

        if (menuItem) {
            menuItem.style.display = "none";
        }
    });
}

setupSidebarByRole();

if (!user || !user.roleCode) {
    window.location.href = "/frontend/pages/auth/login.html";
    throw new Error("User not authenticated.");
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
const emptyState = document.getElementById("emptyState");
const productionLotsTable = document.getElementById("productionLotsTable");
const productionLotsTableBody = document.getElementById("productionLotsTableBody");

// ---- State ----

let productionLots = [];

// ---- Status helpers ----

function getStatusBadgeClass(status) {
    if (!status) return "status-badge-draft";

    var lower = status.toLowerCase();

    if (lower === "draft") return "status-badge-draft";
    if (lower === "pending") return "status-badge-pending";
    if (lower === "approved") return "status-badge-approved";
    if (lower === "harvested") return "status-badge-harvested";
    if (lower === "packaged") return "status-badge-packaged";
    if (lower === "closed") return "status-badge-closed";

    return "status-badge-draft";
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        var date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (e) {
        return dateStr;
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return "—";
    try {
        var date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (e) {
        return dateStr;
    }
}

// ---- Render table ----

function renderProductionLots(lots) {
    if (!lots || lots.length === 0) {
        emptyState.style.display = "flex";
        productionLotsTable.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    productionLotsTable.style.display = "table";

    productionLotsTableBody.innerHTML = "";

    lots.forEach(function (lot) {
        var row = document.createElement("tr");

        var nameCell = document.createElement("td");
        nameCell.textContent = lot.name || "—";

        var farmAreaCell = document.createElement("td");
        farmAreaCell.textContent = lot.farmAreaName || "—";

        var categoryCell = document.createElement("td");
        categoryCell.textContent = lot.productCategoryName || "—";

        var qtyCell = document.createElement("td");
        qtyCell.textContent = lot.expectedQuantity != null ? lot.expectedQuantity : "—";

        var dateCell = document.createElement("td");
        dateCell.textContent = formatDate(lot.plantingDate);

        var statusCell = document.createElement("td");
        var statusBadge = document.createElement("span");
        statusBadge.className = "status-badge " + getStatusBadgeClass(lot.status);
        statusBadge.textContent = lot.status || "DRAFT";
        statusCell.appendChild(statusBadge);

        var createdCell = document.createElement("td");
        createdCell.textContent = formatDateTime(lot.createdAt);

        var actionsCell = document.createElement("td");

var normalizedStatus = String(
    lot.status || ""
).toUpperCase();

var canCreateFarmLog =
    roleCode === "VT-03" &&
    (
        normalizedStatus === "APPROVED" ||
        normalizedStatus === "HARVESTED"
    );

if (canCreateFarmLog) {
    var farmLogButton =
        document.createElement("a");

    farmLogButton.className =
        "btn btn-primary btn-farm-log";

    farmLogButton.textContent =
        "Ghi nhật ký";

    farmLogButton.href =
        "/frontend/pages/cooperative/farm-logs/create.html" +
        "?productionLotId=" +
        encodeURIComponent(lot.id);

    actionsCell.appendChild(
        farmLogButton
    );
} else {
    actionsCell.textContent = "—";
}
        
        row.appendChild(nameCell);
        row.appendChild(farmAreaCell);
        row.appendChild(categoryCell);
        row.appendChild(qtyCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(createdCell);
        row.appendChild(actionsCell);

        productionLotsTableBody.appendChild(row);
    });
}

// ---- Load production lots ----

async function loadProductionLots() {
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    mainContent.style.display = "none";

    try {
        const response = await getProductionLots();

        if (!response.success) {
            throw new Error(response.message || "Failed to load production lots.");
        }

        productionLots = response.data || [];

        loadingState.style.display = "none";
        mainContent.style.display = "block";

        renderProductionLots(productionLots);

    } catch (error) {
        console.error("Load production lots error:", error);

        loadingState.style.display = "none";
        mainContent.style.display = "none";

        var message = error.message || "An unexpected error occurred while loading production lots.";

        // If the endpoint doesn't exist (404), show empty state instead of error
        if (message.indexOf("404") !== -1 || message.toLowerCase().indexOf("not found") !== -1) {
            loadingState.style.display = "none";
            mainContent.style.display = "block";
            renderProductionLots([]);
            return;
        }

        // Handle 403
        if (message.indexOf("403") !== -1) {
            message = "You do not have permission to view production lots.";
        }

        errorMessage.textContent = message;
        errorState.style.display = "flex";
    }
}

// ---- Retry ----

if (retryButton) {
    retryButton.addEventListener("click", function () {
        loadProductionLots();
    });
}

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadProductionLots();