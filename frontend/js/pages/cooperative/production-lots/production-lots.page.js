import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    getProductionLots,
    updateProductionLot
} from "../../../services/production-lot.service.js";
import {
    getFarmAreas,
    getProductCategories
} from "../../../services/production-lot.service.js";
let farmAreas = [];
let productCategories = [];
// ---- Auth check ----

if (!requireAuth()) {
    // redirected to login
}

const user = getUser();
async function loadAllData() {
    loadingState.style.display = "flex";
    try {
        const [lotsRes, farmRes, catRes] = await Promise.all([
            getProductionLots(),
            getFarmAreas(),
            getProductCategories()
        ]);

        // Xử lý production lots
        if (!lotsRes.success) throw new Error(lotsRes.message);
        productionLots = lotsRes.data || [];

        // Xử lý farm areas
        if (farmRes.success) {
            farmAreas = farmRes.data || [];
        }

        // Xử lý categories
        if (catRes.success) {
            productCategories = catRes.data || [];
        }

        loadingState.style.display = "none";
        mainContent.style.display = "block";
        renderProductionLots(productionLots);
    } catch (error) {
        // ... xử lý lỗi
    }
}
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
let editingLotId = null;

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
        const isEditing = editingLotId === lot.id;
        const row = document.createElement("tr");

        // NAME
        const nameCell = document.createElement("td");
        nameCell.innerHTML = isEditing
            ? `<input type="text" class="inline-input" value="${lot.name || ''}" id="edit-name-${lot.id}">`
            : (lot.name || "—");
        // Farm Area
        const farmAreaCell = document.createElement("td");
        if (isEditing) {
            let options = `<option value="">Select</option>`;
            farmAreas.forEach(area => {
                const selected = (area.id === lot.farmAreaId) ? 'selected' : '';
                options += `<option value="${area.id}" ${selected}>${area.name}</option>`;
            });
            farmAreaCell.innerHTML = `<select class="inline-input" id="edit-farm-${lot.id}">${options}</select>`;
        } else {
            farmAreaCell.textContent = lot.farmAreaName || "—";
        }
        const categoryCell = document.createElement("td");
        if (isEditing) {
            let options = `<option value="">Select</option>`;
            productCategories.forEach(cat => {
                const selected = (cat.id === lot.productCategoryId) ? 'selected' : '';
                options += `<option value="${cat.id}" ${selected}>${cat.name}</option>`;
            });
            categoryCell.innerHTML = `<select class="inline-input" id="edit-category-${lot.id}">${options}</select>`;
        } else {
            categoryCell.textContent = lot.productCategoryName || "—";
        }
        // EXPECTED QUANTITY
        const qtyCell = document.createElement("td");
        qtyCell.innerHTML = isEditing
            ? `<input type="number" class="inline-input" value="${lot.expectedQuantity || ''}" id="edit-qty-${lot.id}">`
            : (lot.expectedQuantity != null ? lot.expectedQuantity : "—");

        // PLANTING DATE
        const dateCell = document.createElement("td");
        dateCell.innerHTML = isEditing
            ? `<input type="date" class="inline-input" value="${lot.plantingDate || ''}" id="edit-date-${lot.id}">`
            : formatDate(lot.plantingDate);

        // STATUS
        const statusCell = document.createElement("td");
        if (lot.status === "DRAFT") {
            statusCell.innerHTML = `
                <button
                    class="inline-status"
                    data-id="${lot.id}">
                    Draft
                </button>
            `;
        } else {
            statusCell.innerHTML = `
                <span class="status-badge ${getStatusBadgeClass(lot.status)}">
                    ${lot.status}
                </span>
            `;
        }

        // CREATED
        const createdCell = document.createElement("td");
        createdCell.textContent = formatDateTime(lot.createdAt);

        // ACTIONS
        const actionsCell = document.createElement("td");

        if (isEditing) {
           actionsCell.innerHTML = `
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" data-save="${lot.id}">
                        Save
                    </button>

                    <button class="btn btn-secondary btn-sm" data-cancel="${lot.id}">
                        Cancel
                    </button>
                </div>
            `;
        } else {
            actionsCell.innerHTML = `
                <div class="action-buttons">

                    <button
                        class="btn btn-secondary btn-sm"
                        data-edit="${lot.id}">

                        Edit

                    </button>

                    <button
                        class="btn btn-primary btn-sm"
                        data-attachment="${lot.id}">

                        Attachment

                    </button>

                </div>
            `;
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

    attachTableEvents();
}
function attachTableEvents() {

    // EDIT
    document.querySelectorAll("[data-edit]").forEach(btn => {
        btn.addEventListener("click", () => {
            editingLotId = btn.dataset.edit;
            renderProductionLots(productionLots);
        });
    });

    // CANCEL
    document.querySelectorAll("[data-cancel]").forEach(btn => {
        btn.addEventListener("click", () => {
            editingLotId = null;
            renderProductionLots(productionLots);
        });
    });

    // SAVE
    document.querySelectorAll("[data-save]").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.save;

            const updatedData = {
                name: document.getElementById(`edit-name-${id}`).value,
                farmAreaId: document.getElementById(`edit-farm-${id}`).value,
                productCategoryId: document.getElementById(`edit-category-${id}`).value,
                expectedQuantity: Number(document.getElementById(`edit-qty-${id}`).value),
                plantingDate: document.getElementById(`edit-date-${id}`).value
            };

            try {
                const response = await updateProductionLot(id, updatedData);

                if (!response.success) {
                    throw new Error(response.message || "Update failed");
                }

                // cập nhật local state
                const index = productionLots.findIndex(l => l.id == id);
                if (index > -1) {
                    productionLots[index] = {
                        ...productionLots[index],
                        ...updatedData
                    };
                }

                editingLotId = null;
                renderProductionLots(productionLots);

            } catch (error) {
                alert(error.message);
            }
        });
    });

    // STATUS CHANGE
    document.querySelectorAll(".inline-status").forEach(button => {
    button.addEventListener("click", async () => {

        const id = button.dataset.id;

        // Trạng thái sau khi bấm
        const newStatus = "PENDING";   // hoặc APPROVED

        try {

            const response = await updateProductionLot(id, {
                status: newStatus
            });

            if (!response.success) {
                throw new Error(response.message || "Update status failed");
            }

            const index = productionLots.findIndex(l => l.id == id);

            if (index > -1) {
                productionLots[index].status = newStatus;
            }

            renderProductionLots(productionLots);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }

    });
    document
    .querySelectorAll("[data-attachment]")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const lotId = this.dataset.attachment;

            window.location.href =
                "/frontend/pages/cooperative/production-lots/attachment.html?id=" +
                lotId;

        });

    });
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
const dropdown = document.querySelector(".sidebar-dropdown");
const toggle = document.getElementById("productionDropdown");

toggle.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});
