import {
    requireRole,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    API_BASE_URL
} from "../../../core/api-client.js";

import {
    ROLES
} from "../../../core/permissions.js";

import {
    populateUserInfo
} from "../../../components/user-info.js";

import {
    getProductionLots
} from "../../../services/production-lot.service.js";

import {
    createShipment
} from "../../../services/shipment.service.js";

const PAGE_SIZE = 8;
const SHIPMENT_STORAGE_KEY =
    "nguonGocSo.currentShipment";
const ACTIVATION_PAGE_URL =
    "/frontend/pages/cooperative/trace-codes/activate.html";
const API_ORIGIN =
    API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const STATUS_BADGE_CLASS =
    Object.freeze({
        DRAFT: "badge-neutral",
        CODE_PRINTED: "badge-info",
        ACTIVATED: "badge-active",
        INACTIVE: "badge-inactive",
        ACTIVE: "badge-active",
        RECALLED: "badge-danger"
    });

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
const pageMessage =
    document.getElementById("pageMessage");
const retryButton =
    document.getElementById("retryButton");

const shipmentInfoCard =
    document.getElementById("shipmentInfoCard");
const noShipmentState =
    document.getElementById("noShipmentState");
const shipmentNameElement =
    document.getElementById("shipmentName");
const shipmentIdElement =
    document.getElementById("shipmentId");
const shipmentProductionLotElement =
    document.getElementById("shipmentProductionLot");
const shipmentQuantityElement =
    document.getElementById("shipmentQuantity");
const shipmentStatusBadge =
    document.getElementById("shipmentStatusBadge");
const activateStampButton =
    document.getElementById("activateStampButton");

const shipmentMenuToggle =
    document.getElementById("shipmentMenuToggle");
const shipmentMenuDropdown =
    document.getElementById("shipmentMenuDropdown");
const copyShipmentIdButton =
    document.getElementById("copyShipmentIdButton");
const printAllFromMenuButton =
    document.getElementById("printAllFromMenuButton");

const traceCodeSection =
    document.getElementById("traceCodeSection");
const traceCodeGrid =
    document.getElementById("traceCodeGrid");
const pagination =
    document.getElementById("pagination");
const printBatchButton =
    document.getElementById("printBatchButton");
const traceCardTemplate =
    document.getElementById("traceCardTemplate");

const openCreateShipmentButton =
    document.getElementById("openCreateShipmentButton");
const createShipmentModal =
    document.getElementById("createShipmentModal");
const createShipmentModalClose =
    document.getElementById("createShipmentModalClose");
const cancelCreateShipmentButton =
    document.getElementById("cancelCreateShipmentButton");
const generateShipmentForm =
    document.getElementById("generateShipmentForm");
const productionLotSelect =
    document.getElementById("productionLotId");
const shipmentNameInput =
    document.getElementById("shipmentNameInput");
const totalQuantityInput =
    document.getElementById("totalQuantityInput");
const packagingInfoInput =
    document.getElementById("packagingInfoInput");
const generateButton =
    document.getElementById("generateButton");

const printModal =
    document.getElementById("printModal");
const printModalClose =
    document.getElementById("printModalClose");
const printContent =
    document.getElementById("printContent");
const printButton =
    document.getElementById("printButton");
const cancelPrintButton =
    document.getElementById("cancelPrintButton");

let productionLots = [];
let currentShipment = null;
let currentPage = 1;
let currentPrintTrace = null;

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
        "Không thể tải dữ liệu.";

    showOnly(errorState);
}

function showPageMessage(
    message,
    type = "success"
) {
    pageMessage.textContent = message;
    pageMessage.className =
        `tc-message tc-message-${type}`;
    pageMessage.hidden = false;
}

function hidePageMessage() {
    pageMessage.hidden = true;
    pageMessage.textContent = "";
}

function getResponseData(response) {
    return response?.data ?? response;
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
            "Không thể lưu tạm lô hàng.",
            error
        );
    }
}

async function loadProductionLots() {
    showOnly(loadingState);

    try {
        const response =
            await getProductionLots();
        const lots =
            getResponseData(response);

        productionLots =
            (Array.isArray(lots) ? lots : [])
                .filter(function (lot) {
                    return lot.status ===
                        "PACKAGED";
                });

        renderProductionLotOptions();
        showOnly(mainContent);

        currentShipment =
            readStoredShipment();
        selectShipment(currentShipment);
        applyProductionLotFromQuery();
    } catch (error) {
        console.error(error);

        showError(
            error?.message ||
            "Không thể tải danh sách lô sản xuất."
        );
    }
}

function renderProductionLotOptions() {
    productionLotSelect.replaceChildren();

    const placeholder =
        document.createElement("option");

    placeholder.value = "";
    placeholder.textContent =
        productionLots.length > 0
            ? "Chọn lô sản xuất"
            : "Không có lô sản xuất đã đóng gói";
    placeholder.disabled =
        productionLots.length === 0;

    productionLotSelect.appendChild(
        placeholder
    );

    productionLots.forEach(function (lot) {
        const option =
            document.createElement("option");

        option.value = lot.id;
        option.textContent =
            lot.name ||
            lot.code ||
            lot.id;

        productionLotSelect.appendChild(
            option
        );
    });
}

function applyProductionLotFromQuery() {
    const searchParams =
        new URLSearchParams(
            window.location.search
        );
    const productionLotId =
        searchParams.get(
            "productionLotId"
        );

    if (
        !productionLotId ||
        !productionLots.some(function (lot) {
            return String(lot.id) ===
                productionLotId;
        })
    ) {
        return;
    }

    productionLotSelect.value =
        productionLotId;
    openCreateShipmentModal();
}

function openCreateShipmentModal() {
    hidePageMessage();
    createShipmentModal.hidden = false;
    productionLotSelect.focus();
}

function closeCreateShipmentModal() {
    createShipmentModal.hidden = true;
    generateShipmentForm.reset();
}

function validateForm() {
    if (!productionLotSelect.value) {
        alert(
            "Vui lòng chọn lô sản xuất."
        );
        productionLotSelect.focus();

        return false;
    }

    if (!shipmentNameInput.value.trim()) {
        alert(
            "Vui lòng nhập tên lô hàng."
        );
        shipmentNameInput.focus();

        return false;
    }

    const quantity =
        Number(totalQuantityInput.value);

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        alert(
            "Số lượng mã QR phải là số nguyên lớn hơn 0."
        );
        totalQuantityInput.focus();

        return false;
    }

    return true;
}

function setGenerateLoading(isLoading) {
    generateButton.disabled =
        isLoading;
    generateButton.textContent =
        isLoading
            ? "Đang tạo..."
            : "Tạo mã QR";
}

async function handleGenerateShipment(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const payload = {
        productionLotId:
            productionLotSelect.value,
        name:
            shipmentNameInput.value.trim(),
        totalQuantity:
            Number(totalQuantityInput.value),
        packagingInfo:
            packagingInfoInput.value.trim()
    };

    try {
        setGenerateLoading(true);

        const response =
            await createShipment(payload);
        const shipment =
            getResponseData(response);

        if (!shipment?.id) {
            throw new Error(
                "Máy chủ không trả về thông tin lô hàng."
            );
        }

        currentShipment = shipment;
        currentPage = 1;
        storeShipment(shipment);
        selectShipment(shipment);
        closeCreateShipmentModal();
        showPageMessage(
            "Đã tạo lô hàng và sinh mã QR. Bạn có thể in hoặc kích hoạt tem."
        );
    } catch (error) {
        console.error(error);

        alert(
            error?.message ||
            "Tạo lô hàng và sinh mã QR thất bại."
        );
    } finally {
        setGenerateLoading(false);
    }
}

function selectShipment(shipment) {
    const hasShipment =
        Boolean(shipment?.id);

    shipmentInfoCard.hidden =
        !hasShipment;
    traceCodeSection.hidden =
        !hasShipment;
    noShipmentState.hidden =
        hasShipment;

    if (!hasShipment) {
        return;
    }

    renderShipmentCard(shipment);
    renderTraceGrid();
}

function renderShipmentCard(shipment) {
    shipmentNameElement.textContent =
        shipment.name || "—";
    shipmentIdElement.textContent =
        shipment.id || "—";
    shipmentProductionLotElement.textContent =
        shipment.productionLotName || "—";
    shipmentQuantityElement.textContent =
        `${shipment.totalQuantity || 0} mã`;

    renderStatusBadge(
        shipmentStatusBadge,
        shipment.status
    );

    activateStampButton.hidden =
        shipment.status !==
        "CODE_PRINTED";
}

function renderStatusBadge(
    element,
    status
) {
    element.textContent =
        status || "—";
    element.className =
        `badge ${
            STATUS_BADGE_CLASS[status] ||
            "badge-neutral"
        }`;
}

function renderTraceGrid() {
    const traceCodes =
        currentShipment?.traceCodes || [];

    traceCodeGrid.replaceChildren();

    if (traceCodes.length === 0) {
        const emptyElement =
            document.createElement("div");

        emptyElement.className =
            "empty-trace";
        emptyElement.textContent =
            "Chưa có mã truy xuất.";

        traceCodeGrid.appendChild(
            emptyElement
        );
        pagination.replaceChildren();

        return;
    }

    const totalPages =
        Math.ceil(
            traceCodes.length /
            PAGE_SIZE
        );

    currentPage =
        Math.min(currentPage, totalPages) ||
        1;

    const start =
        (currentPage - 1) *
        PAGE_SIZE;

    traceCodes
        .slice(
            start,
            start + PAGE_SIZE
        )
        .forEach(function (trace) {
            traceCodeGrid.appendChild(
                buildTraceCard(trace)
            );
        });

    renderPagination(totalPages);
}

function buildTraceCard(trace) {
    const fragment =
        traceCardTemplate.content
            .cloneNode(true);
    const image =
        fragment.querySelector(
            ".trace-qr-image"
        );
    const codeValue =
        fragment.querySelector(
            ".trace-code-value"
        );
    const statusBadge =
        fragment.querySelector(
            ".trace-status"
        );

    image.src =
        getQrImageUrl(trace.qrImage);
    image.alt =
        trace.codeValue
            ? `Mã QR ${trace.codeValue}`
            : "Mã QR";
    image.addEventListener(
        "error",
        function () {
            image.hidden = true;
        },
        { once: true }
    );

    codeValue.textContent =
        trace.codeValue || "—";

    renderStatusBadge(
        statusBadge,
        trace.status
    );

    fragment
        .querySelector(".btn-download")
        .addEventListener(
            "click",
            function () {
                downloadQr(trace);
            }
        );

    fragment
        .querySelector(".btn-print")
        .addEventListener(
            "click",
            function () {
                openPrintModal(trace);
            }
        );

    return fragment;
}

function renderPagination(totalPages) {
    pagination.replaceChildren();

    if (totalPages <= 1) {
        return;
    }

    appendPageButton(
        "‹",
        currentPage - 1,
        currentPage === 1,
        false,
        "Trang trước"
    );

    for (
        let page = 1;
        page <= totalPages;
        page += 1
    ) {
        appendPageButton(
            String(page),
            page,
            false,
            page === currentPage,
            `Trang ${page}`
        );
    }

    appendPageButton(
        "›",
        currentPage + 1,
        currentPage === totalPages,
        false,
        "Trang sau"
    );
}

function appendPageButton(
    label,
    page,
    disabled,
    isActive,
    ariaLabel
) {
    const button =
        document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.classList.toggle(
        "active",
        isActive
    );
    button.setAttribute(
        "aria-label",
        ariaLabel
    );

    if (isActive) {
        button.setAttribute(
            "aria-current",
            "page"
        );
    }

    button.addEventListener(
        "click",
        function () {
            currentPage = page;
            renderTraceGrid();
        }
    );

    pagination.appendChild(button);
}

function getQrImageUrl(path) {
    if (!path) {
        return "";
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    return new URL(
        path,
        `${API_ORIGIN}/`
    ).href;
}

function downloadQr(trace) {
    const qrImageUrl =
        getQrImageUrl(trace.qrImage);

    if (!qrImageUrl) {
        alert(
            "Mã QR này chưa có ảnh để tải."
        );

        return;
    }

    const link =
        document.createElement("a");

    link.href = qrImageUrl;
    link.download =
        `${trace.codeValue || "ma-qr"}.png`;
    link.target = "_blank";
    link.rel = "noopener";

    document.body.appendChild(link);
    link.click();
    link.remove();
}

function openPrintModal(trace) {
    currentPrintTrace = trace;
    printContent.innerHTML =
        buildPrintCardHtml(trace);
    printModal.hidden = false;
}

function closePrintModal() {
    printModal.hidden = true;
    currentPrintTrace = null;
}

function printBatch() {
    const traceCodes =
        currentShipment?.traceCodes || [];

    if (traceCodes.length === 0) {
        alert(
            "Chưa có mã QR để in."
        );

        return;
    }

    printCards(traceCodes);
}

function buildPrintCardHtml(trace) {
    return `
        <article class="print-card">
            <img
                src="${escapeHtml(getQrImageUrl(trace.qrImage))}"
                alt="${escapeHtml(trace.codeValue || "Mã QR")}"
            >
            <h3>${escapeHtml(trace.codeValue || "—")}</h3>
            <p>${escapeHtml(currentShipment?.name || "—")}</p>
            <p>${escapeHtml(currentShipment?.productionLotName || "—")}</p>
        </article>
    `;
}

function printCards(traceCodes) {
    const popup =
        window.open(
            "",
            "_blank",
            "width=800,height=900"
        );

    if (!popup) {
        alert(
            "Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép cửa sổ bật lên."
        );

        return;
    }

    const cardsHtml =
        traceCodes
            .map(buildPrintCardHtml)
            .join("");

    popup.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>In tem QR</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .print-card {
                    display: inline-block;
                    width: 260px;
                    padding: 20px;
                    text-align: center;
                    page-break-inside: avoid;
                }
                .print-card img {
                    width: 220px;
                    height: 220px;
                    object-fit: contain;
                }
                .print-card h3 { margin: 12px 0 4px; }
                .print-card p { margin: 2px 0; color: #555; }
            </style>
        </head>
        <body>${cardsHtml}</body>
        </html>
    `);

    popup.document.close();
    popup.addEventListener(
        "load",
        function () {
            popup.focus();
            popup.print();
            popup.close();
        },
        { once: true }
    );
}

function escapeHtml(value) {
    const element =
        document.createElement("div");

    element.textContent =
        value || "";

    return element.innerHTML;
}

function goToActivationPage() {
    if (!currentShipment?.id) {
        return;
    }

    storeShipment(currentShipment);

    const params =
        new URLSearchParams({
            shipmentId:
                currentShipment.id
        });

    window.location.href =
        `${ACTIVATION_PAGE_URL}?${params.toString()}`;
}

function bindEvents() {
    retryButton.addEventListener(
        "click",
        loadProductionLots
    );
    openCreateShipmentButton
        .addEventListener(
            "click",
            openCreateShipmentModal
        );
    createShipmentModalClose
        .addEventListener(
            "click",
            closeCreateShipmentModal
        );
    cancelCreateShipmentButton
        .addEventListener(
            "click",
            closeCreateShipmentModal
        );
    createShipmentModal.addEventListener(
        "click",
        function (event) {
            if (
                event.target ===
                createShipmentModal
            ) {
                closeCreateShipmentModal();
            }
        }
    );
    generateShipmentForm.addEventListener(
        "submit",
        handleGenerateShipment
    );

    shipmentMenuToggle.addEventListener(
        "click",
        function () {
            shipmentMenuDropdown.hidden =
                !shipmentMenuDropdown.hidden;
            shipmentMenuToggle.setAttribute(
                "aria-expanded",
                String(
                    !shipmentMenuDropdown.hidden
                )
            );
        }
    );
    document.addEventListener(
        "click",
        function (event) {
            if (
                !shipmentMenuDropdown
                    .contains(event.target) &&
                event.target !==
                    shipmentMenuToggle
            ) {
                shipmentMenuDropdown.hidden =
                    true;
                shipmentMenuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
    copyShipmentIdButton.addEventListener(
        "click",
        async function () {
            if (!currentShipment?.id) {
                return;
            }

            try {
                await navigator.clipboard
                    .writeText(
                        currentShipment.id
                    );
                showPageMessage(
                    "Đã sao chép ID lô hàng."
                );
            } catch (error) {
                console.error(error);
                showPageMessage(
                    "Không thể sao chép ID lô hàng.",
                    "error"
                );
            }

            shipmentMenuDropdown.hidden =
                true;
        }
    );
    printAllFromMenuButton
        .addEventListener(
            "click",
            function () {
                shipmentMenuDropdown.hidden =
                    true;
                printBatch();
            }
        );
    activateStampButton.addEventListener(
        "click",
        goToActivationPage
    );

    printBatchButton.addEventListener(
        "click",
        printBatch
    );
    printModalClose.addEventListener(
        "click",
        closePrintModal
    );
    cancelPrintButton.addEventListener(
        "click",
        closePrintModal
    );
    printModal.addEventListener(
        "click",
        function (event) {
            if (event.target === printModal) {
                closePrintModal();
            }
        }
    );
    printButton.addEventListener(
        "click",
        function () {
            if (currentPrintTrace) {
                printCards([
                    currentPrintTrace
                ]);
            }
        }
    );
}

async function initializePage() {
    setupLogout();
    populateUserInfo();
    bindEvents();

    if (!requireRole(ROLES.ORG_MANAGER)) {
        showOnly(unauthorizedState);

        return;
    }

    await loadProductionLots();
}

initializePage();
