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
    submitProductionLot,
    approveProductionLot,
    returnToDraftProductionLot
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

// ---- Modal DOM references ----

const confirmModal =
    document.getElementById(
        "confirmModal"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const modalMessage =
    document.getElementById(
        "modalMessage"
    );

const modalConfirm =
    document.getElementById(
        "modalConfirm"
    );

const modalCancel =
    document.getElementById(
        "modalCancel"
    );

// ---- Return to Draft Modal DOM references ----

const returnToDraftModal =
    document.getElementById(
        "returnToDraftModal"
    );

const returnToDraftReason =
    document.getElementById(
        "returnToDraftReason"
    );

const returnToDraftError =
    document.getElementById(
        "returnToDraftError"
    );

const returnToDraftCancel =
    document.getElementById(
        "returnToDraftCancel"
    );

const returnToDraftConfirm =
    document.getElementById(
        "returnToDraftConfirm"
    );

// ---- State ----

let productionLots = [];
let farmAreas = [];
let productCategories = [];
let editingLotId = null;

// ---- Reusable modal ----

let modalResolve = null;
let modalReject = null;

function showConfirmModal(
    title,
    message
) {
    return new Promise(
        function (resolve, reject) {
            modalTitle.textContent =
                title;
            modalMessage.textContent =
                message;
            confirmModal
                .style.display = "flex";

            modalResolve = resolve;
            modalReject = reject;
        }
    );
}

function closeConfirmModal() {
    confirmModal
        .style.display = "none";
    modalResolve = null;
    modalReject = null;
}

modalConfirm.addEventListener(
    "click",
    function () {
        if (modalResolve) {
            modalResolve(true);
        }

        closeConfirmModal();
    }
);

modalCancel.addEventListener(
    "click",
    function () {
        if (modalResolve) {
            modalResolve(false);
        }

        closeConfirmModal();
    }
);

confirmModal.addEventListener(
    "click",
    function (event) {
        if (
            event.target ===
            confirmModal
        ) {
            if (modalResolve) {
                modalResolve(false);
            }

            closeConfirmModal();
        }
    }
);

// ---- Close all action menus ----

function closeAllActionMenus() {
    document
        .querySelectorAll(
            ".action-menu-container"
        )
        .forEach(
            function (container) {
                container.remove();
            }
        );
}

// ---- Global click to close menus ----

document.addEventListener(
    "click",
    function (event) {
        if (
            !event.target
                .closest(
                    ".action-menu-trigger"
                ) &&
            !event.target
                .closest(
                    ".action-menu-container"
                )
        ) {
            closeAllActionMenus();
        }
    }
);

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

function isDraftStatus(status) {
    return String(status)
        .toUpperCase() === "DRAFT";
}

// ---- Create action menu ----

function createActionMenu(
    lot,
    actionsCell
) {
    const status =
        String(
            lot.status
        ).toUpperCase();

    const menuTrigger =
        document.createElement(
            "button"
        );

    menuTrigger.type = "button";

    menuTrigger.className =
        "action-menu-trigger";

    menuTrigger.textContent =
        "\u22EE";

    menuTrigger.dataset.lotId =
        lot.id;

    menuTrigger.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            closeAllActionMenus();

            const existingMenu =
                actionsCell
                    .querySelector(
                        ".action-menu-container"
                    );

            if (existingMenu) {
                existingMenu
                    .remove();

                return;
            }

            const menu =
                createMenuItems(
                    lot
                );

            if (!menu) {
                return;
            }

            actionsCell
                .appendChild(
                    menu
                );
        }
    );

    actionsCell.appendChild(
        menuTrigger
    );
}

// ---- Create menu items based on status ----

function createMenuItems(lot) {
    const status =
        String(
            lot.status
        ).toUpperCase();

    const menu =
        document.createElement(
            "div"
        );

    menu.className =
        "action-menu-container";

    var items = [];

    if (status === "DRAFT") {
        items = [
            {
                label:
                    "Edit Lot",
                action:
                    "edit"
            },
            {
                label:
                    "Submit for Approval",
                action:
                    "submit"
            }
        ];
    } else if (
        status === "PENDING"
    ) {
        if (
            user.roleCode ===
            "VT-02"
        ) {
            items = [
                {
                    label:
                        "Approve Lot",
                    action:
                        "approve"
                },
                {
                    label:
                        "Return to Draft",
                    action:
                        "return-to-draft"
                }
            ];
        } else {
            items = [
                {
                    label:
                        "Return to Draft",
                    action:
                        "return-to-draft"
                }
            ];
        }
    }

    if (items.length === 0) {
        var lockedItem =
            document.createElement(
                "div"
            );

        lockedItem.className =
            "action-menu-item action-menu-item-locked";

        lockedItem.textContent =
            "Locked";

        menu.appendChild(
            lockedItem
        );

        return menu;
    }

    items.forEach(
        function (item) {
            var menuItem =
                document.createElement(
                    "div"
                );

            menuItem.className =
                "action-menu-item";

            menuItem.dataset
                .action = item.action;

            menuItem.textContent =
                item.label;

            menuItem.addEventListener(
                "click",
                function (
                    event
                ) {
                    event
                        .stopPropagation();

                    handleActionMenuClick(
                        lot,
                        item.action,
                        menuItem
                    );
                }
            );

            menu.appendChild(
                menuItem
            );
        }
    );

    return menu;
}

// ---- Handle action menu click ----

async function handleActionMenuClick(
    lot,
    action,
    menuItem
) {
    closeAllActionMenus();

    if (
        action === "edit"
    ) {
        if (
            !isDraftStatus(
                lot.status
            )
        ) {
            alert(
                "Chi lô Draft mới được chỉnh sửa."
            );

            return;
        }

        editingLotId =
            String(lot.id);

        renderProductionLots(
            productionLots
        );

        return;
    }

    if (
        action === "submit"
    ) {
        await handleSubmitAction(
            lot,
            menuItem
        );

        return;
    }

    if (
        action === "approve"
    ) {
        await handleApproveAction(
            lot,
            menuItem
        );

        return;
    }

    if (
        action ===
        "return-to-draft"
    ) {
        await handleReturnToDraftAction(
            lot,
            menuItem
        );

        return;
    }
}

// ---- Submit for Approval ----

async function handleSubmitAction(
    lot,
    menuItem
) {
    if (
        !isDraftStatus(
            lot.status
        )
    ) {
        alert(
            "Chi lô Draft mới được gửi duyệt."
        );

        return;
    }

    var confirmed =
        await showConfirmModal(
            "Confirm Submission",
            "Are you sure you want to submit this production lot for approval?"
        );

    if (!confirmed) {
        return;
    }

    var oldText =
        menuItem.textContent;

    menuItem.disabled = true;

    menuItem.textContent =
        "Submitting...";

    try {
        var response =
            await submitProductionLot(
                lot.id
            );

        if (
            !response ||
            response.success ===
                false
        ) {
            throw new Error(
                response
                    ?.message ||
                    "Submit failed."
            );
        }

        editingLotId = null;

        alert(
            "Da chuyen lo san xuat sang Pending."
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
                "Khong the chuyen sang Pending."
            )
        );
    } finally {
        menuItem.disabled =
            false;

        menuItem.textContent =
            oldText;
    }
}

// ---- Approve Lot ----

async function handleApproveAction(
    lot,
    menuItem
) {
    if (
        String(
            lot.status
        ).toUpperCase() !==
        "PENDING"
    ) {
        alert(
            "Chi lo Pending moi duoc duyet."
        );

        return;
    }

    if (
        user.roleCode !== "VT-02"
    ) {
        alert(
            "Ban khong co quyen duyet lo san xuat."
        );

        return;
    }

    var confirmed =
        await showConfirmModal(
            "Confirm Approval",
            "Are you sure you want to approve this production lot?"
        );

    if (!confirmed) {
        return;
    }

    var oldText =
        menuItem.textContent;

    menuItem.disabled = true;

    menuItem.textContent =
        "Approving...";

    try {
        var response =
            await approveProductionLot(
                lot.id
            );

        if (
            !response ||
            response.success ===
                false
        ) {
            throw new Error(
                response
                    ?.message ||
                    "Approve failed."
            );
        }

        alert(
            "Phe duyet lo san xuat thanh cong."
        );

        await loadAllData();
    } catch (error) {
        console.error(
            "Approve production lot error:",
            error
        );

        alert(
            getErrorMessage(
                error,
                "Khong the phe duyet lo san xuat."
            )
        );
    } finally {
        menuItem.disabled =
            false;

        menuItem.textContent =
            oldText;
    }
}

// ---- Return to Draft Modal helpers ----

function closeReturnToDraftModal() {
    returnToDraftModal.style.display = "none";
}

returnToDraftCancel.addEventListener(
    "click",
    function () {
        closeReturnToDraftModal();
    }
);

returnToDraftModal.addEventListener(
    "click",
    function (event) {
        if (event.target === returnToDraftModal) {
            closeReturnToDraftModal();
        }
    }
);

// ---- Return to Draft ----

let returnToDraftPendingLot = null;

returnToDraftConfirm.addEventListener(
    "click",
    async function () {
        if (!returnToDraftPendingLot) {
            return;
        }

        var reason = returnToDraftReason.value.trim();

        if (!reason) {
            returnToDraftError.style.display = "block";
            returnToDraftReason.focus();
            return;
        }

        returnToDraftError.style.display = "none";
        returnToDraftConfirm.disabled = true;
        returnToDraftConfirm.textContent = "Returning...";

        try {
            var response =
                await returnToDraftProductionLot(
                    returnToDraftPendingLot.id,
                    reason
                );

            if (
                !response ||
                response.success ===
                    false
            ) {
                throw new Error(
                    response
                        ?.message ||
                        "Return to Draft failed."
                );
            }

            closeReturnToDraftModal();

            alert(
                "The production lot has been returned to Draft successfully."
            );

            await loadAllData();
        } catch (error) {
            console.error(
                "Return to Draft production lot error:",
                error
            );

            returnToDraftConfirm.disabled = false;
            returnToDraftConfirm.textContent = "Return to Draft";

            alert(
                getErrorMessage(
                    error,
                    "Unable to return the production lot to Draft."
                )
            );
        }
    }
);

async function handleReturnToDraftAction(
    lot,
    menuItem
) {
    if (
        String(
            lot.status
        ).toUpperCase() !==
        "PENDING"
    ) {
        alert(
            "Chi lo Pending moi co the tra ve Draft."
        );

        return;
    }

    returnToDraftPendingLot = lot;
    returnToDraftReason.value = "";
    returnToDraftError.style.display = "none";
    returnToDraftConfirm.disabled = false;
    returnToDraftConfirm.textContent = "Return to Draft";
    returnToDraftModal.style.display = "flex";
    returnToDraftReason.focus();
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
            isDraftStatus(lot.status);

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

        if (isEditing) {
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
        } else if (
            isDraft ||
            String(lot.status)
                .toUpperCase() ===
                "PENDING"
        ) {
            createActionMenu(
                lot,
                actionsCell
            );
        } else {
            const lockedText =
                document.createElement(
                    "span"
                );

            lockedText.className =
                "action-locked";

            lockedText.textContent =
                "Locked";

            lockedText.title =
                "This production lot cannot be modified.";

            actionsCell.appendChild(
                lockedText
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
                    function () {
                        saveProductionLot(
                            button.dataset.save,
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
        !isDraftStatus(lot.status)
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

    const quantityInput =
    document.getElementById(
        `edit-qty-${id}`
    );

const quantityValue =
    quantityInput.value.trim();

const plantingDate =
    document.getElementById(
        `edit-date-${id}`
    ).value;

/*
 * Phải kiểm tra dữ liệu không hợp lệ trước kiểm tra bỏ trống.
 * Với input type="number", nhập chữ có thể làm value thành chuỗi rỗng,
 * nhưng validity.badInput sẽ bằng true.
 */
if (quantityInput.validity.badInput) {
    alert(
        "Sản lượng dự kiến chỉ được nhập số."
    );

    quantityInput.focus();
    return;
}

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

const expectedQuantity =
    Number(quantityValue);

if (!Number.isFinite(expectedQuantity)) {
    alert(
        "Sản lượng dự kiến chỉ được nhập số."
    );

    quantityInput.focus();
    return;
}

if (expectedQuantity <= 0) {
    alert(
        "Sản lượng dự kiến phải lớn hơn 0."
    );

    quantityInput.focus();
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