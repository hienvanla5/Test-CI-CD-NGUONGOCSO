import {
    requireRole,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    ROLES
} from "../../../core/permissions.js";

import {
    populateUserInfo
} from "../../../components/user-info.js";

import {
    activateShipmentTraceCodes
} from "../../../services/trace-code.service.js";

const SHIPMENTS_PAGE_URL =
    "/frontend/pages/cooperative/shipments/index.html";
const SHIPMENT_STORAGE_KEY =
    "nguonGocSo.currentShipment";

const loadingState =
    document.getElementById("loadingState");
const errorState =
    document.getElementById("errorState");
const unauthorizedState =
    document.getElementById("unauthorizedState");
const mainContent =
    document.getElementById("mainContent");
const errorMessage =
    document.getElementById("errorMessage");

const shipmentNameElement =
    document.getElementById("shipmentName");
const shipmentIdElement =
    document.getElementById("shipmentId");
const productionLotNameElement =
    document.getElementById("productionLotName");
const totalQuantityElement =
    document.getElementById("totalQuantity");
const shipmentStatusElement =
    document.getElementById("shipmentStatus");

const activationMessage =
    document.getElementById("activationMessage");
const confirmationRow =
    document.getElementById("confirmationRow");
const activationConfirmation =
    document.getElementById("activationConfirmation");
const activateButton =
    document.getElementById("activateButton");
const cancelButton =
    document.getElementById("cancelButton");
const backButton =
    document.getElementById("backButton");
const returnToShipmentsButton =
    document.getElementById("returnToShipmentsButton");

let currentShipment = null;
let isSubmitting = false;

function showOnly(stateElement) {
    [
        loadingState,
        errorState,
        unauthorizedState,
        mainContent
    ].forEach(function (element) {
        element.hidden =
            element !== stateElement;
    });
}

function showError(message) {
    errorMessage.textContent =
        message ||
        "Không tìm thấy thông tin lô hàng.";

    showOnly(errorState);
}

function getShipmentIdFromQuery() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("shipmentId") ||
        ""
    ).trim();
}

function readStoredShipment() {
    try {
        const value =
            sessionStorage.getItem(
                SHIPMENT_STORAGE_KEY
            );

        return value
            ? JSON.parse(value)
            : null;
    } catch (error) {
        console.warn(
            "Không thể đọc lô hàng đã lưu.",
            error
        );

        return null;
    }
}

function storeShipment(shipment) {
    try {
        sessionStorage.setItem(
            SHIPMENT_STORAGE_KEY,
            JSON.stringify(shipment)
        );
    } catch (error) {
        console.warn(
            "Không thể lưu trạng thái lô hàng.",
            error
        );
    }
}

function renderShipment(shipment) {
    shipmentNameElement.textContent =
        shipment.name || "—";
    shipmentIdElement.textContent =
        shipment.id || "—";
    productionLotNameElement.textContent =
        shipment.productionLotName || "—";
    totalQuantityElement.textContent =
        `${shipment.totalQuantity || 0} tem`;
    shipmentStatusElement.textContent =
        shipment.status || "—";

    const isActivated =
        shipment.status === "ACTIVATED";

    shipmentStatusElement.className =
        `status-badge ${
            isActivated
                ? "status-active"
                : "status-pending"
        }`;

    if (isActivated) {
        const traceCodes =
            Array.isArray(shipment.traceCodes)
                ? shipment.traceCodes
                : [];
        const activeCount =
            traceCodes.filter(
                function (traceCode) {
                    return traceCode.status ===
                        "ACTIVE";
                }
            ).length;

        showActivationMessage(
            `Kích hoạt thành công: ${activeCount} mã tem đang ở trạng thái ACTIVE.`,
            "success"
        );
        confirmationRow.hidden = true;
        activateButton.hidden = true;
    } else {
        activationMessage.hidden = true;
        confirmationRow.hidden = false;
        activateButton.hidden = false;
        activateButton.disabled =
            !activationConfirmation.checked;
    }
}

function showActivationMessage(
    message,
    type
) {
    activationMessage.textContent =
        message;
    activationMessage.className =
        `activation-message activation-message-${type}`;
    activationMessage.hidden = false;
}

function setSubmitting(submitting) {
    isSubmitting = submitting;
    activationConfirmation.disabled =
        submitting;
    activateButton.disabled =
        submitting ||
        !activationConfirmation.checked;
    activateButton.textContent =
        submitting
            ? "Đang kích hoạt..."
            : "Kích hoạt tem";
}

async function activateStamps() {
    if (
        isSubmitting ||
        !currentShipment?.id ||
        !activationConfirmation.checked
    ) {
        return;
    }

    if (
        currentShipment.status !==
        "CODE_PRINTED"
    ) {
        showActivationMessage(
            "Lô hàng không ở trạng thái CODE_PRINTED nên không thể kích hoạt.",
            "error"
        );

        return;
    }

    try {
        setSubmitting(true);
        activationMessage.hidden = true;

        const response =
            await activateShipmentTraceCodes(
                currentShipment.id
            );
        const shipment =
            response?.data ?? response;

        if (!shipment?.id) {
            throw new Error(
                "Máy chủ không trả về kết quả kích hoạt."
            );
        }

        currentShipment = shipment;
        storeShipment(shipment);
        renderShipment(shipment);
    } catch (error) {
        console.error(error);

        showActivationMessage(
            error?.message ||
            "Kích hoạt tem thất bại.",
            "error"
        );
    } finally {
        setSubmitting(false);
    }
}

function goBack() {
    window.location.href =
        SHIPMENTS_PAGE_URL;
}

function bindEvents() {
    backButton.addEventListener(
        "click",
        goBack
    );
    returnToShipmentsButton
        .addEventListener(
            "click",
            goBack
        );
    cancelButton.addEventListener(
        "click",
        goBack
    );
    activationConfirmation
        .addEventListener(
            "change",
            function () {
                activateButton.disabled =
                    isSubmitting ||
                    !activationConfirmation.checked;
            }
        );
    activateButton.addEventListener(
        "click",
        activateStamps
    );
}

function initializePage() {
    setupLogout();
    populateUserInfo();
    bindEvents();

    if (!requireRole(ROLES.ORG_MANAGER)) {
        showOnly(unauthorizedState);

        return;
    }

    const shipmentId =
        getShipmentIdFromQuery();
    const storedShipment =
        readStoredShipment();

    if (!shipmentId) {
        showError(
            "Thiếu mã lô hàng cần kích hoạt. Hãy tạo hoặc chọn lô hàng từ màn mã QR."
        );

        return;
    }

    if (
        !storedShipment?.id ||
        String(storedShipment.id) !==
            shipmentId
    ) {
        showError(
            "Không tìm thấy dữ liệu lô hàng trong phiên hiện tại. Hãy quay lại màn mã QR và chọn kích hoạt tem."
        );

        return;
    }

    currentShipment = storedShipment;

    if (
        ![
            "CODE_PRINTED",
            "ACTIVATED"
        ].includes(currentShipment.status)
    ) {
        showError(
            `Lô hàng đang ở trạng thái ${currentShipment.status || "không xác định"} và chưa đủ điều kiện kích hoạt.`
        );

        return;
    }

    renderShipment(currentShipment);
    showOnly(mainContent);
}

initializePage();
