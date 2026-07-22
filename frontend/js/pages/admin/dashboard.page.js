import {
    requireAuth,
    setupLogout
} from "../../core/auth-guard.js";

import {
    getUser
} from "../../core/storage.js";

import {
    getOrganizations
} from "../../services/organization.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href = "/pages/auth/login.html";
}

const roleCode = user.roleCode;

const allowedRoles = ["VT-01"];

if (!allowedRoles.includes(roleCode)) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("unauthorizedState").style.display = "flex";
    document.getElementById("dashboardContent").style.display = "none";
    throw new Error("Access denied: user does not have permission to access the Admin Dashboard.");
}

// ---- DOM references ----

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const unauthorizedState = document.getElementById("unauthorizedState");
const dashboardContent = document.getElementById("dashboardContent");
const emptyState = document.getElementById("emptyState");
const organizationTable = document.getElementById("organizationTable");
const organizationTableBody = document.getElementById("organizationTableBody");
const totalOrganizationsEl = document.getElementById("totalOrganizations");
const activeOrganizationsEl = document.getElementById("activeOrganizations");
const inactiveOrganizationsEl = document.getElementById("inactiveOrganizations");
const organizationTypesEl = document.getElementById("organizationTypes");

// ---- Load organizations ----

async function loadOrganizations() {
    // Show loading, hide others
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    unauthorizedState.style.display = "none";
    dashboardContent.style.display = "none";

    try {
        const response = await getOrganizations();

        if (!response.success) {
            throw new Error(response.message || "Failed to load organizations.");
        }

        const organizations = response.data || [];

        // Hide loading, show content
        loadingState.style.display = "none";
        dashboardContent.style.display = "block";

        // Render
        renderOrganizations(organizations);
        renderSummary(organizations);

    } catch (error) {
        console.error("Load organizations error:", error);

        loadingState.style.display = "none";
        dashboardContent.style.display = "none";

        errorMessage.textContent = error.message || "An unexpected error occurred while loading organizations.";
        errorState.style.display = "flex";
    }
}

// ---- Render summary ----

function renderSummary(organizations) {
    const total = organizations.length;

    const active = organizations.filter(function (org) {
        return org.status === "ACTIVE";
    }).length;

    const inactive = total - active;

    // Count by type
    var typeMap = {};

    organizations.forEach(function (org) {
        var type = org.organizationType || "UNKNOWN";

        if (!typeMap[type]) {
            typeMap[type] = 0;
        }

        typeMap[type]++;
    });

    var typeLabels = {
        "COOPERATIVE": "Cooperative",
        "ENTERPRISE": "Enterprise",
        "GOVERNMENT": "Government",
        "SYSTEM": "System",
        "UNKNOWN": "Unknown"
    };

    var typeParts = [];

    Object.keys(typeMap).forEach(function (type) {
        var label = typeLabels[type] || type;
        typeParts.push(label + ": " + typeMap[type]);
    });

    totalOrganizationsEl.textContent = total;
    activeOrganizationsEl.textContent = active;
    inactiveOrganizationsEl.textContent = inactive;
    organizationTypesEl.textContent = typeParts.length > 0 ? typeParts.join(" | ") : "—";
}

// ---- Render organization list ----

function renderOrganizations(organizations) {
    if (!organizations || organizations.length === 0) {
        organizationTable.style.display = "none";
        emptyState.style.display = "flex";
        return;
    }

    emptyState.style.display = "none";
    organizationTable.style.display = "table";

    // Clear existing rows
    organizationTableBody.innerHTML = "";

    organizations.forEach(function (org) {
        var row = document.createElement("tr");

        // Name
        var nameCell = document.createElement("td");
        nameCell.setAttribute("data-label", "Name");
        nameCell.textContent = org.organizationName || "—";
        row.appendChild(nameCell);

        // Code
        var codeCell = document.createElement("td");
        codeCell.setAttribute("data-label", "Code");
        codeCell.textContent = org.organizationCode || "—";
        row.appendChild(codeCell);

        // Type
        var typeCell = document.createElement("td");
        typeCell.setAttribute("data-label", "Type");

        var typeBadge = document.createElement("span");
        typeBadge.className = "type-badge";

        var type = org.organizationType || "";
        var typeLabels = {
            "COOPERATIVE": "Cooperative",
            "ENTERPRISE": "Enterprise",
            "GOVERNMENT": "Government",
            "SYSTEM": "System"
        };

        typeBadge.textContent = typeLabels[type] || type;

        // Add specific class for type colors
        if (type === "ENTERPRISE") {
            typeBadge.classList.add("type-badge-enterprise");
        } else if (type === "GOVERNMENT") {
            typeBadge.classList.add("type-badge-government");
        } else if (type === "SYSTEM") {
            typeBadge.classList.add("type-badge-system");
        }

        typeCell.appendChild(typeBadge);
        row.appendChild(typeCell);

        // Status
        var statusCell = document.createElement("td");
        statusCell.setAttribute("data-label", "Status");

        var statusBadge = document.createElement("span");
        statusBadge.className = "status-badge";

        var status = org.status || "";

        if (status === "ACTIVE") {
            statusBadge.classList.add("status-badge-active");
            statusBadge.textContent = "Active";
        } else if (status === "INACTIVE") {
            statusBadge.classList.add("status-badge-inactive");
            statusBadge.textContent = "Inactive";
        } else {
            statusBadge.textContent = status || "—";
        }

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Created At
        var createdCell = document.createElement("td");
        createdCell.setAttribute("data-label", "Created At");

        if (org.createdAt) {
            try {
                var date = new Date(org.createdAt);
                createdCell.textContent = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });
            } catch (e) {
                createdCell.textContent = org.createdAt;
            }
        } else {
            createdCell.textContent = "—";
        }

        row.appendChild(createdCell);

        organizationTableBody.appendChild(row);
    });
}

// ---- Retry ----

retryButton.addEventListener("click", function () {
    loadOrganizations();
});

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadOrganizations();