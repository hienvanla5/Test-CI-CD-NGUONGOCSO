import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    getProductionLots,
    getFarmAreas,
    getProductCategories,
    updateProductionLot,
    submitProductionLot
} from "../../../services/production-lot.service.js";

// ---- Auth check ----

if (!requireAuth()) {
    throw new Error("User not authenticated.");
}

const user = getUser();

if (!user || !user.roleCode) {
    window.location.href =
        "/frontend/pages/auth/login.html";

    throw new Error(
        "User not authenticated."
    );
}

const allowedRoles = [
    "VT-01",
    "VT-02",
    "VT-03"
];

if (!allowedRoles.includes(user.roleCode)) {
    document
        .getElementById("loadingState")
        .style.display = "none";

    document
        .getElementById("unauthorizedState")
        .style.display = "flex";

    document
        .getElementById("mainContent")
        .style.display = "none";

    throw new Error(
        "Access denied."
    );
}

// ---- Populate user info ----

function populateUserInfo() {
    const sidebarName =
        document.getElementById(
            "sidebarUserName"
        );

    const sidebarOrg =
        document.getElementById(
            "sidebarUserOrg"
        );

    const sidebarAvatar =
        document.getElementById(
            "sidebarUserAvatar"
        );

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

    const headerName =
        document.getElementById(
            "headerUserName"
        );

    const headerOrg =
        document.getElementById(
            "headerUserOrg"
        );

    const headerRole =
        document.getElementById(
            "headerUserRole"
        );

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
    document.getElementById(
        "loadingState"
    );

const errorState =
    document.getElementById(
        "errorState"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const retryButton =
    document.getElementById(
        "retryButton"
    );

const mainContent =
    document.getElementById(
        "mainContent"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const productionLotsTable =
    document.getElementById(
        "productionLotsTable"
    );

const productionLotsTableBody =
    document.getElementById(
        "productionLotsTableBody"
    );

// ---- State ----

let productionLots = [];
let farmAreas = [];
let productCategories = [];
let editingLotId = null;

// ---- Helpers ----

function getStatusBadgeClass(status) {
    const lower =
        String(
            status || "draft"
        ).toLowerCase();

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

    const date =
        new Date(dateStr);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateStr;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}

function getDateInputValue(dateStr) {
    if (!dateStr) {
        return "";
    }

    return String(dateStr)
        .substring(0, 10);
}

function getErrorMessage(
    error,
    fallbackMessage
) {
    if (!error) {
        return fallbackMessage;
    }

    return (
        error.message ||
        fallbackMessage
    );
}

function createOption(
    value,
    label,
    selectedValue
) {
    const option =
        document.createElement(
            "option"
        );

    option.value = value;
    option.textContent = label;

    option.selected =
        String(value) ===
        String(selectedValue);

    return option;
}

// ---- Render table ----

function renderProductionLots(lots) {
    if (
        !lots ||
        lots.length === 0
    ) {
        emptyState.style.display =
            "flex";

        productionLotsTable
            .style.display = "none";

        productionLotsTableBody
            .innerHTML = "";

        return;
    }

    emptyState.style.display =
        "none";

    productionLotsTable
        .style.display = "table";

    productionLotsTableBody
        .innerHTML = "";

    lots.forEach(function (lot) {
        const isDraft =
            lot.status === "DRAFT";

        const isEditing =
            isDraft &&
            String(editingLotId) ===
                String(lot.id);

        const row =
            document.createElement(
                "tr"
            );

        // NAME

        const nameCell =
            document.createElement(
                "td"
            );

        if (isEditing) {
            const nameInput =
                document.createElement(
                    "input"
                );

            nameInput.type = "text";

            nameInput.className =
                "inline-input";

            nameInput.id =
                `edit-name-${lot.id}`;

            nameInput.value =
                lot.name || "";

            nameCell.appendChild(
                nameInput
            );
        } else {
            nameCell.textContent =
                lot.name || "—";
        }

        // FARM AREA

        const farmAreaCell =
            document.createElement(
                "td"
            );

        if (isEditing) {
            const farmAreaSelect =
                document.createElement(
                    "select"
                );

            farmAreaSelect.className =
                "inline-input";

            farmAreaSelect.id =
                `edit-farm-${lot.id}`;

            farmAreaSelect.appendChild(
                createOption(
                    "",
                    "Select",
                    lot.farmAreaId
                )
            );

            farmAreas.forEach(
                function (area) {
                    farmAreaSelect
                        .appendChild(
                            createOption(
                                area.id,
                                area.name ||
                                    "—",
                                lot.farmAreaId
                            )
                        );
                }
            );

            farmAreaCell.appendChild(
                farmAreaSelect
            );
        } else {
            farmAreaCell.textContent =
                lot.farmAreaName ||
                "—";
        }

        // PRODUCT CATEGORY

        const categoryCell =
            document.createElement(
                "td"
            );

        if (isEditing) {
            const categorySelect =
                document.createElement(
                    "select"
                );

            categorySelect.className =
                "inline-input";

            categorySelect.id =
                `edit-category-${lot.id}`;

            categorySelect.appendChild(
                createOption(
                    "",
                    "Select",
                    lot.productCategoryId
                )
            );

            productCategories.forEach(
                function (category) {
                    categorySelect
                        .appendChild(
                            createOption(
                                category.id,
                                category.name ||
                                    "—",
                                lot.productCategoryId
                            )
                        );
                }
            );

            categoryCell.appendChild(
                categorySelect
            );
        } else {
            categoryCell.textContent =
                lot.productCategoryName ||
                "—";
        }

        // EXPECTED QUANTITY

        const qtyCell =
            document.createElement(
                "td"
            );

        if (isEditing) {
            const quantityInput =
                document.createElement(
                    "input"
                );

            quantityInput.type =
                "number";

            quantityInput.min =
                "0.01";

            quantityInput.step =
                "0.01";

            quantityInput.className =
                "inline-input";

            quantityInput.id =
                `edit-qty-${lot.id}`;

            quantityInput.value =
                lot.expectedQuantity ??
                "";

            qtyCell.appendChild(
                quantityInput
            );
        } else {
            qtyCell.textContent =
                lot.expectedQuantity ??
                "—";
        }

        // PLANTING DATE

        const dateCell =
            document.createElement(
                "td"
            );

        if (isEditing) {
            const dateInput =
                document.createElement(
                    "input"
                );

            dateInput.type = "date";

            dateInput.className =
                "inline-input";

            dateInput.id =
                `edit-date-${lot.id}`;

            dateInput.value =
                getDateInputValue(
                    lot.plantingDate
                );

            dateCell.appendChild(
                dateInput
            );
        } else {
            dateCell.textContent =
                formatDate(
                    lot.plantingDate
                );
        }

        // STATUS

        const statusCell =
            document.createElement(
                "td"
            );

        if (isDraft) {
            const statusButton =
                document.createElement(
                    "button"
                );

            statusButton.type =
                "button";

            statusButton.className =
                "inline-status";

            statusButton.dataset.submit =
                lot.id;

            statusButton.textContent =
                "Draft";

            statusButton.disabled =
                isEditing;

            statusButton.title =
                isEditing
                    ? "Hãy Save hoặc Cancel trước."
                    : "Bấm để chuyển sang Pending.";

            statusCell.appendChild(
                statusButton
            );
        } else {
            const statusBadge =
                document.createElement(
                    "span"
                );

            statusBadge.className =
                `status-badge ${getStatusBadgeClass(
                    lot.status
                )}`;

            statusBadge.textContent =
                lot.status || "—";

            statusCell.appendChild(
                statusBadge
            );
        }

        // CREATED

        const createdCell =
            document.createElement(
                "td"
            );

        createdCell.textContent =
            formatDate(
                lot.createdAt
            );

        // ACTIONS

        const actionsCell =
            document.createElement(
                "td"
            );

        if (!isDraft) {
            const lockedText =
                document.createElement(
                    "span"
                );

            lockedText.className =
                "action-locked";

            lockedText.textContent =
                "Locked";

            lockedText.title =
                "Lô Pending không được chỉnh sửa.";

            actionsCell.appendChild(
                lockedText
            );
        } else if (isEditing) {
            const actionGroup =
                document.createElement(
                    "div"
                );

            actionGroup.className =
                "action-buttons";

            const saveButton =
                document.createElement(
                    "button"
                );

            saveButton.type =
                "button";

            saveButton.className =
                "btn btn-primary btn-sm";

            saveButton.dataset.save =
                lot.id;

            saveButton.textContent =
                "Save";

            const cancelButton =
                document.createElement(
                    "button"
                );

            cancelButton.type =
                "button";

            cancelButton.className =
                "btn btn-secondary btn-sm";

            cancelButton.dataset.cancel =
                lot.id;

            cancelButton.textContent =
                "Cancel";

            actionGroup.appendChild(
                saveButton
            );

            actionGroup.appendChild(
                cancelButton
            );

            actionsCell.appendChild(
                actionGroup
            );
        } else {
            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "btn btn-secondary btn-sm";

            editButton.dataset.edit =
                lot.id;

            editButton.textContent =
                "Edit";

            actionsCell.appendChild(
                editButton
            );
        }

        row.appendChild(nameCell);
        row.appendChild(farmAreaCell);
        row.appendChild(categoryCell);
        row.appendChild(qtyCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(createdCell);
        row.appendChild(actionsCell);

        productionLotsTableBody
            .appendChild(row);
    });

    attachTableEvents();
}

// ---- Table events ----

function attachTableEvents() {
    document
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        const lot =
                            productionLots.find(
                                function (
                                    item
                                ) {
                                    return (
                                        String(
                                            item.id
                                        ) ===
                                        String(
                                            button
                                                .dataset
                                                .edit
                                        )
                                    );
                                }
                            );

                        if (
                            !lot ||
                            lot.status !==
                                "DRAFT"
                        ) {
                            alert(
                                "Chỉ lô Draft mới được chỉnh sửa."
                            );

                            return;
                        }

                        editingLotId =
                            button.dataset.edit;

                        renderProductionLots(
                            productionLots
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            "[data-cancel]"
        )
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        editingLotId =
                            null;

                        renderProductionLots(
                            productionLots
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            "[data-save]"
        )
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    async function () {
                        await saveProductionLot(
                            button.dataset.save,
                            button
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            "[data-submit]"
        )
        .forEach(
            function (button) {
                button.addEventListener(
                    "click",
                    async function () {
                        await handleSubmitProductionLot(
                            button.dataset
                                .submit,
                            button
                        );
                    }
                );
            }
        );
}

async function saveProductionLot(
    id,
    saveButton
) {
    const lot =
        productionLots.find(
            function (item) {
                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );

    if (
        !lot ||
        lot.status !== "DRAFT"
    ) {
        alert(
            "Chỉ lô Draft mới được chỉnh sửa."
        );

        return;
    }

    const name =
        document
            .getElementById(
                `edit-name-${id}`
            )
            .value
            .trim();

    const farmAreaId =
        document.getElementById(
            `edit-farm-${id}`
        ).value;

    const productCategoryId =
        document.getElementById(
            `edit-category-${id}`
        ).value;

    const quantityValue =
        document.getElementById(
            `edit-qty-${id}`
        ).value;

    const plantingDate =
        document.getElementById(
            `edit-date-${id}`
        ).value;

    const expectedQuantity =
        Number(quantityValue);

    if (
        !name ||
        !farmAreaId ||
        !productCategoryId ||
        !quantityValue ||
        !plantingDate
    ) {
        alert(
            "Vui lòng nhập đầy đủ thông tin."
        );

        return;
    }

    if (
        !Number.isFinite(
            expectedQuantity
        ) ||
        expectedQuantity <= 0
    ) {
        alert(
            "Sản lượng dự kiến phải lớn hơn 0."
        );

        return;
    }

    const updatedData = {
        name,
        farmAreaId,
        productCategoryId,
        expectedQuantity,
        plantingDate
    };

    const oldText =
        saveButton.textContent;

    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";

    try {
        const response =
            await updateProductionLot(
                id,
                updatedData
            );

        if (
            !response ||
            response.success === false
        ) {
            throw new Error(
                response?.message ||
                "Update failed."
            );
        }

        editingLotId = null;

        alert(
            "Cập nhật lô sản xuất thành công."
        );

        await loadAllData();
    } catch (error) {
        console.error(
            "Update production lot error:",
            error
        );

        alert(
            getErrorMessage(
                error,
                "Không thể cập nhật lô sản xuất."
            )
        );
    } finally {
        saveButton.disabled =
            false;

        saveButton.textContent =
            oldText;
    }
}

async function handleSubmitProductionLot(
    id,
    statusButton
) {
    const lot =
        productionLots.find(
            function (item) {
                return (
                    String(item.id) ===
                    String(id)
                );
            }
        );

    if (
        !lot ||
        lot.status !== "DRAFT"
    ) {
        alert(
            "Chỉ lô Draft mới được gửi duyệt."
        );

        return;
    }

    const confirmed =
        window.confirm(
            "Sau khi chuyển sang Pending, lô sản xuất sẽ không thể chỉnh sửa. Bạn có chắc chắn không?"
        );

    if (!confirmed) {
        return;
    }

    const oldText =
        statusButton.textContent;

    statusButton.disabled = true;

    statusButton.textContent =
        "Submitting...";

    try {
        const response =
            await submitProductionLot(
                id
            );

        if (
            !response ||
            response.success === false
        ) {
            throw new Error(
                response?.message ||
                "Submit failed."
            );
        }

        editingLotId = null;

        alert(
            "Đã chuyển lô sản xuất sang Pending."
        );

        await loadAllData();
    } catch (error) {
        console.error(
            "Submit production lot error:",
            error
        );

        alert(
            getErrorMessage(
                error,
                "Không thể chuyển sang Pending."
            )
        );
    } finally {
        statusButton.disabled =
            false;

        statusButton.textContent =
            oldText;
    }
}

// ---- Load data ----

async function loadAllData() {
    loadingState.style.display =
        "flex";

    errorState.style.display =
        "none";

    mainContent.style.display =
        "none";

    try {
        const [
            lotsResponse,
            farmAreasResponse,
            categoriesResponse
        ] = await Promise.all([
            getProductionLots(),
            getFarmAreas(),
            getProductCategories()
        ]);

        if (
            !lotsResponse ||
            lotsResponse.success === false
        ) {
            throw new Error(
                lotsResponse?.message ||
                "Failed to load production lots."
            );
        }

        productionLots =
            lotsResponse.data || [];

        farmAreas =
            farmAreasResponse
                ?.success === false
                ? []
                : (
                    farmAreasResponse
                        ?.data || []
                );

        productCategories =
            categoriesResponse
                ?.success === false
                ? []
                : (
                    categoriesResponse
                        ?.data || []
                );

        loadingState.style.display =
            "none";

        mainContent.style.display =
            "block";

        renderProductionLots(
            productionLots
        );
    } catch (error) {
        console.error(
            "Load production lot data error:",
            error
        );

        loadingState.style.display =
            "none";

        mainContent.style.display =
            "none";

        let message =
            getErrorMessage(
                error,
                "An unexpected error occurred."
            );

        if (
            message.includes("404") ||
            message
                .toLowerCase()
                .includes("not found")
        ) {
            mainContent.style.display =
                "block";

            renderProductionLots([]);

            return;
        }

        if (
            message.includes("403")
        ) {
            message =
                "You do not have permission to view production lots.";
        }

        errorMessage.textContent =
            message;

        errorState.style.display =
            "flex";
    }
}

// ---- Retry ----

if (retryButton) {
    retryButton.addEventListener(
        "click",
        function () {
            loadAllData();
        }
    );
}

// ---- Setup logout ----

setupLogout();

// ---- Initial load ----

loadAllData();