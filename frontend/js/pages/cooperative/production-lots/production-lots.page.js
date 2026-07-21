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

if (!user || !user.roleCode) {
    window.location.href =
        "/nguon-goc-so/frontend/pages/auth/login.html";

    throw new Error("User not authenticated.");
}

const roleCode = user.roleCode;

const allowedRoles = ["VT-01", "VT-02", "VT-03"];

if (!allowedRoles.includes(roleCode)) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("unauthorizedState").style.display = "flex";
    document.getElementById("mainContent").style.display = "none";

    throw new Error(
        "Access denied: user does not have permission to access this page."
    );
}

// ---- Populate user info ----

function populateUserInfo() {
    var sidebarName =
        document.getElementById("sidebarUserName");

    var sidebarOrg =
        document.getElementById("sidebarUserOrg");

    var sidebarAvatar =
        document.getElementById("sidebarUserAvatar");

    if (sidebarName) {
        sidebarName.textContent =
            user.fullName ||
            user.username ||
            "—";
    }

    if (sidebarOrg) {
        sidebarOrg.textContent =
            user.organizationName ||
            "—";
    }

    if (sidebarAvatar) {
        sidebarAvatar.textContent =
            (
                user.fullName ||
                user.username ||
                "?"
            )[0].toUpperCase();
    }

    var headerName =
        document.getElementById("headerUserName");

    var headerOrg =
        document.getElementById("headerUserOrg");

    var headerRole =
        document.getElementById("headerUserRole");

    if (headerName) {
        headerName.textContent =
            user.fullName ||
            user.username ||
            "—";
    }

    if (headerOrg) {
        headerOrg.textContent =
            user.organizationName ||
            "—";
    }

    if (headerRole) {
        headerRole.textContent =
            user.roleCode ||
            "—";
    }
}

populateUserInfo();

// ---- DOM references ----

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const mainContent =
    document.getElementById("mainContent");

const emptyState =
    document.getElementById("emptyState");

const productionLotsTable =
    document.getElementById("productionLotsTable");

const productionLotsTableBody =
    document.getElementById("productionLotsTableBody");

// Modal edit

const editLotModal =
    document.getElementById("editLotModal");

const editLotOverlay =
    document.getElementById("editLotOverlay");

const closeEditLotButton =
    document.getElementById("closeEditLotButton");

const cancelEditLotButton =
    document.getElementById("cancelEditLotButton");

const editLotForm =
    document.getElementById("editLotForm");

const editLotMessage =
    document.getElementById("editLotMessage");

const editFields = {
    id:
        document.getElementById("editLotId"),

    name:
        document.getElementById("editLotName"),

    farmAreaId:
        document.getElementById("editFarmAreaId"),

    productCategoryId:
        document.getElementById(
            "editProductCategoryId"
        ),

    expectedQuantity:
        document.getElementById(
            "editExpectedQuantity"
        ),

    plantingDate:
        document.getElementById(
            "editPlantingDate"
        )
};

// ---- State ----

let productionLots = [];

const USE_MOCK_DATA = true;
/*
 * Dữ liệu tạm cho 2 select.
 * Khi tích hợp backend, thay bằng API vùng trồng
 * và API danh mục nông sản.
 */
const mockFarmAreas = [
    {
        id: "farm-001",
        name: "Khu vực canh tác A1"
    },
    {
        id: "farm-002",
        name: "Khu vực canh tác B1"
    }
];

const mockProductCategories = [
    {
        id: "category-001",
        name: "Cà chua"
    },
    {
        id: "category-002",
        name: "Xoài Cát Chu"
    }
];

// ---- Status helpers ----

function getStatusBadgeClass(status) {
    if (!status) {
        return "status-badge-draft";
    }

    var lower = status.toLowerCase();

    if (lower === "draft") {
        return "status-badge-draft";
    }

    if (lower === "pending") {
        return "status-badge-pending";
    }

    if (lower === "approved") {
        return "status-badge-approved";
    }

    if (lower === "harvested") {
        return "status-badge-harvested";
    }

    if (lower === "packaged") {
        return "status-badge-packaged";
    }

    if (lower === "closed") {
        return "status-badge-closed";
    }

    return "status-badge-draft";
}

function formatDate(dateStr) {
    if (!dateStr) {
        return "—";
    }

    var date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) {
        return "—";
    }

    var date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
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
        var row =
            document.createElement("tr");

        var nameCell =
            document.createElement("td");

        nameCell.textContent =
            lot.name || "—";

        var farmAreaCell =
            document.createElement("td");

        farmAreaCell.textContent =
            lot.farmAreaName || "—";

        var categoryCell =
            document.createElement("td");

        categoryCell.textContent =
            lot.productCategoryName || "—";

        var qtyCell =
            document.createElement("td");

        qtyCell.textContent =
            lot.expectedQuantity != null
                ? lot.expectedQuantity
                : "—";

        var dateCell =
            document.createElement("td");

        dateCell.textContent =
            formatDate(lot.plantingDate);

        var statusCell =
            document.createElement("td");

        var statusBadge =
            document.createElement("span");

        statusBadge.className =
            "status-badge " +
            getStatusBadgeClass(lot.status);

        statusBadge.textContent =
            lot.status || "DRAFT";

        statusCell.appendChild(statusBadge);

        var createdCell =
            document.createElement("td");

        createdCell.textContent =
            formatDateTime(lot.createdAt);

        var actionCell =
            document.createElement("td");

        var editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.className =
            "btn btn-secondary btn-edit-lot";

        editButton.dataset.id = lot.id;
        editButton.textContent = "Sửa";

        var normalizedStatus =
            String(lot.status || "")
                .trim()
                .toUpperCase();

        if (normalizedStatus !== "DRAFT") {
            editButton.disabled = true;

            editButton.title =
                "Chỉ có thể sửa lô ở trạng thái DRAFT";
        }

        actionCell.appendChild(editButton);

        row.appendChild(nameCell);
        row.appendChild(farmAreaCell);
        row.appendChild(categoryCell);
        row.appendChild(qtyCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(createdCell);
        row.appendChild(actionCell);

        productionLotsTableBody.appendChild(row);
    });
}

// ---- Modal helpers ----

function fillSelect(
    selectElement,
    items,
    placeholder
) {
    selectElement.innerHTML = "";

    var defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = placeholder;

    selectElement.appendChild(defaultOption);

    items.forEach(function (item) {
        var option =
            document.createElement("option");

        option.value = item.id;
        option.textContent = item.name;

        selectElement.appendChild(option);
    });
}

function loadEditSelectOptions() {
    fillSelect(
        editFields.farmAreaId,
        mockFarmAreas,
        "-- Chọn khu vực canh tác --"
    );

    fillSelect(
        editFields.productCategoryId,
        mockProductCategories,
        "-- Chọn loại nông sản --"
    );
}

function openEditLotModal(lotId) {
    var lot = productionLots.find(
        function (item) {
            return item.id === lotId;
        }
    );

    if (!lot) {
        return;
    }

    loadEditSelectOptions();

    editFields.id.value =
        lot.id || "";

    editFields.name.value =
        lot.name || "";

    editFields.farmAreaId.value =
        lot.farmAreaId || "";

    editFields.productCategoryId.value =
        lot.productCategoryId || "";

    editFields.expectedQuantity.value =
        lot.expectedQuantity ?? "";

    editFields.plantingDate.value =
        lot.plantingDate || "";

    editLotMessage.hidden = true;
    editLotModal.hidden = false;

    document.body.classList.add(
        "modal-open"
    );
}

function closeEditLotModal() {
    editLotModal.hidden = true;

    document.body.classList.remove(
        "modal-open"
    );

    editLotForm.reset();
    editLotMessage.hidden = true;
}

/*
 * Hiện tại chỉ chuẩn bị payload đúng API Docs.
 * Chưa gọi PUT vì chưa tích hợp API cập nhật.
 */
function handleEditLotSubmit(event) {
    event.preventDefault();

    var lotId =
        editFields.id.value;

    var payload = {
        farmAreaId:
            editFields.farmAreaId.value,

        productCategoryId:
            editFields.productCategoryId.value,

        name:
            editFields.name.value.trim(),

        expectedQuantity:
            Number(
                editFields.expectedQuantity.value
            ),

        plantingDate:
            editFields.plantingDate.value
    };

    console.log(
        "PUT /api/v1/production-lots/" + lotId
    );

    console.log(
        "Update payload:",
        payload
    );

    editLotMessage.textContent =
        "Giao diện đã sẵn sàng. Dữ liệu cập nhật đã được tạo trong Console.";

    editLotMessage.className =
        "modal-message success";

    editLotMessage.hidden = false;
}

// ---- Load production lots ----

async function loadProductionLots() {
    loadingState.style.display = "flex";
    errorState.style.display = "none";
    mainContent.style.display = "none";

    try {
        if (USE_MOCK_DATA) {
    productionLots = [
        {
            id: "lot-001",
            name: "Lô cà chua vụ đông 2026",
            farmAreaId: "farm-001",
            farmAreaName: "Khu vực canh tác A1",
            productCategoryId: "category-001",
            productCategoryName: "Cà chua",
            expectedQuantity: 500,
            plantingDate: "2026-08-01",
            status: "DRAFT",
            createdAt: "2026-07-21T10:00:00"
        },
        {
            id: "lot-002",
            name: "Lô xoài đợt 1 năm 2026",
            farmAreaId: "farm-002",
            farmAreaName: "Khu vực canh tác B1",
            productCategoryId: "category-002",
            productCategoryName: "Xoài Cát Chu",
            expectedQuantity: 1200,
            plantingDate: "2026-07-25",
            status: "APPROVED",
            createdAt: "2026-07-20T08:30:00"
        }
    ];
} else {
    const response =
        await getProductionLots();

    if (!response.success) {
        throw new Error(
            response.message ||
            "Failed to load production lots."
        );
    }

    productionLots =
        response.data || [];
}

        loadingState.style.display = "none";
        mainContent.style.display = "block";

        renderProductionLots(
            productionLots
        );
    } catch (error) {
        console.error(
            "Load production lots error:",
            error
        );

        loadingState.style.display = "none";
        mainContent.style.display = "none";

        var message =
            error.message ||
            "An unexpected error occurred while loading production lots.";

        if (
            message.indexOf("404") !== -1 ||
            message
                .toLowerCase()
                .indexOf("not found") !== -1
        ) {
            mainContent.style.display = "block";
            renderProductionLots([]);
            return;
        }

        if (message.indexOf("403") !== -1) {
            message =
                "You do not have permission to view production lots.";
        }

        errorMessage.textContent = message;
        errorState.style.display = "flex";
    }
}

// ---- Events ----

if (retryButton) {
    retryButton.addEventListener(
        "click",
        loadProductionLots
    );
}

productionLotsTableBody.addEventListener(
    "click",
    function (event) {
        var editButton =
            event.target.closest(
                ".btn-edit-lot"
            );

        if (!editButton) {
            return;
        }

        openEditLotModal(
            editButton.dataset.id
        );
    }
);

editLotForm.addEventListener(
    "submit",
    handleEditLotSubmit
);

closeEditLotButton.addEventListener(
    "click",
    closeEditLotModal
);

cancelEditLotButton.addEventListener(
    "click",
    closeEditLotModal
);

editLotOverlay.addEventListener(
    "click",
    closeEditLotModal
);

document.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Escape" &&
            !editLotModal.hidden
        ) {
            closeEditLotModal();
        }
    }
);

setupLogout();

loadProductionLots();