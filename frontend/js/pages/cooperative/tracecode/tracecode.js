import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getCurrentUser
} from "../../../services/auth.service.js";

import {
    getProductionLots
} from "../../../services/production-lot.service.js";

import {
    createShipment
} from "../../../services/shipment.service.js";

/* ============================================================
 * Auth
 * ============================================================ */

requireAuth();

setupLogout();

/* ============================================================
 * Constants
 * ============================================================ */

// Chỉ dùng để dựng URL ảnh QR khi qrImage trả về
// là đường dẫn tương đối (vd: "/files/qr/...").
const API_FILE_BASE_URL = "http://localhost:8080";

const PAGE_SIZE = 8;

// Gộp trạng thái của cả Shipment (DRAFT, CODE_PRINTED,
// ACTIVATED, RECALLED) và TraceCode (INACTIVE, ACTIVE,
// RECALLED). Trace Code vừa sinh ra trong story này luôn
// là INACTIVE (kích hoạt tem là story khác), nhưng badge
// vẫn cần map đủ các trạng thái có thể có ở nơi khác.
const STATUS_BADGE_CLASS = {
    DRAFT: "badge-neutral",
    CODE_PRINTED: "badge-info",
    ACTIVATED: "badge-active",
    INACTIVE: "badge-inactive",
    ACTIVE: "badge-active",
    RECALLED: "badge-danger"
};

/* ============================================================
 * DOM
 * ============================================================ */

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const unauthorizedState = document.getElementById("unauthorizedState");
const mainContent = document.getElementById("mainContent");
const retryButton = document.getElementById("retryButton");
const errorMessage = document.getElementById("errorMessage");

const shipmentInfoCard = document.getElementById("shipmentInfoCard");
const noShipmentState = document.getElementById("noShipmentState");
const shipmentNameEl = document.getElementById("shipmentName");
const shipmentIdEl = document.getElementById("shipmentId");
const shipmentProductionLotEl = document.getElementById("shipmentProductionLot");
const shipmentQuantityEl = document.getElementById("shipmentQuantity");
const shipmentStatusBadge = document.getElementById("shipmentStatusBadge");

const shipmentMenuToggle = document.getElementById("shipmentMenuToggle");
const shipmentMenuDropdown = document.getElementById("shipmentMenuDropdown");
const copyShipmentIdButton = document.getElementById("copyShipmentIdButton");
const printAllFromMenuButton = document.getElementById("printAllFromMenuButton");

const traceCodeSection = document.getElementById("traceCodeSection");
const traceCodeGrid = document.getElementById("traceCodeGrid");
const pagination = document.getElementById("pagination");
const printBatchButton = document.getElementById("printBatchButton");

const traceCardTemplate = document.getElementById("traceCardTemplate");

const openCreateShipmentButton = document.getElementById("openCreateShipmentButton");
const createShipmentModal = document.getElementById("createShipmentModal");
const createShipmentModalClose = document.getElementById("createShipmentModalClose");
const cancelCreateShipmentButton = document.getElementById("cancelCreateShipmentButton");
const generateShipmentForm = document.getElementById("generateShipmentForm");
const productionLotSelect = document.getElementById("productionLotId");
const shipmentNameInput = document.getElementById("shipmentNameInput");
const totalQuantityInput = document.getElementById("totalQuantityInput");
const packagingInfoInput = document.getElementById("packagingInfoInput");
const generateButton = document.getElementById("generateButton");

const printModal = document.getElementById("printModal");
const printModalClose = document.getElementById("printModalClose");
const printContent = document.getElementById("printContent");
const printButton = document.getElementById("printButton");
const cancelPrintButton = document.getElementById("cancelPrintButton");

/* ============================================================
 * State
 * ============================================================ */

let productionLots = [];
let currentShipment = null;
let currentPage = 1;
let currentPrintTrace = null;

/* ============================================================
 * User info
 * ============================================================ */

async function populateUserInformation() {

    try {

        const response = await getCurrentUser();

        const user = response?.data ?? response;

        if (!user) {
            return;
        }

        document.getElementById("sidebarUserAvatar").textContent =
            user.fullName?.charAt(0)?.toUpperCase() ?? "U";

        document.getElementById("sidebarUserName").textContent =
            user.fullName ?? "-";

        document.getElementById("sidebarUserOrg").textContent =
            user.organizationName ?? "-";

        document.getElementById("headerUserName").textContent =
            user.fullName ?? "-";

        document.getElementById("headerUserOrg").textContent =
            user.organizationName ?? "-";

        document.getElementById("headerUserRole").textContent =
            user.roleCode ?? "-";

    } catch (error) {

        // Không chặn luồng chính nếu chỉ lỗi hiển thị thông tin user.
        console.error(error);
    }
}

/* ============================================================
 * UI state
 * ============================================================ */

function showLoading() {
    loadingState.style.display = "";
    errorState.style.display = "none";
    mainContent.style.display = "none";
}

function showContent() {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    mainContent.style.display = "";
}

function showError(message) {
    loadingState.style.display = "none";
    mainContent.style.display = "none";
    errorState.style.display = "";
    errorMessage.textContent = message;
}

function showUnauthorized() {
    loadingState.style.display = "none";
    mainContent.style.display = "none";
    errorState.style.display = "none";
    unauthorizedState.style.display = "";
}

/* ============================================================
 * Production lots (chỉ những lô đã PACKAGED
 * mới được phép chọn để tạo lô hàng, theo mục 3
 * của tài liệu API — backend cũng sẽ tự chặn
 * bằng lỗi 409 nếu sai trạng thái)
 * ============================================================ */

async function loadProductionLots() {

    try {

        showLoading();

        const response = await getProductionLots();

        const lots = response?.data ?? [];

        productionLots = lots.filter(
            lot => !lot.status || lot.status === "PACKAGED"
        );

        renderProductionLotOptions();

        showContent();

    } catch (error) {

        console.error(error);

        // Lưu ý: api-client.js chỉ tự redirect khi gặp lỗi 401
        // (không throw error.status ra ngoài trong trường hợp đó).
        // Với mọi lỗi khác (403 sai quyền, 500, mất kết nối...),
        // nó chỉ throw Error(message) mà KHÔNG có field .status,
        // nên không thể phân biệt 403 ở đây. Vì vậy hiển thị luôn
        // message thật từ server/lỗi mạng để biết chính xác
        // nguyên nhân, thay vì một câu chung chung che mất lỗi gốc.
        showError(
            error?.message ??
            "Không thể tải danh sách lô sản xuất."
        );
    }
}

function renderProductionLotOptions() {

    productionLotSelect.innerHTML =
        `<option value="">Select Production Lot</option>`;

    productionLots.forEach(lot => {

        const option = document.createElement("option");

        option.value = lot.id;
        option.textContent = lot.name;

        productionLotSelect.appendChild(option);
    });

    if (productionLots.length === 0) {

        productionLotSelect.innerHTML +=
            `<option value="" disabled>Không có lô sản xuất đã đóng gói</option>`;
    }
}

retryButton.addEventListener("click", loadProductionLots);

/* ============================================================
 * Create shipment modal
 * ============================================================ */

openCreateShipmentButton.addEventListener("click", () => {
    createShipmentModal.style.display = "flex";
});

function closeCreateShipmentModal() {
    createShipmentModal.style.display = "none";
    generateShipmentForm.reset();
}

createShipmentModalClose.addEventListener("click", closeCreateShipmentModal);
cancelCreateShipmentButton.addEventListener("click", closeCreateShipmentModal);

createShipmentModal.addEventListener("click", event => {
    if (event.target === createShipmentModal) {
        closeCreateShipmentModal();
    }
});

generateShipmentForm.addEventListener("submit", handleGenerateShipment);

async function handleGenerateShipment(event) {

    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const payload = {
        productionLotId: productionLotSelect.value,
        name: shipmentNameInput.value.trim(),
        totalQuantity: Number(totalQuantityInput.value),
        packagingInfo: packagingInfoInput.value.trim()
    };

    try {

        setGenerateLoading(true);

        const response = await createShipment(payload);

        currentShipment = response.data;
        currentPage = 1;

        selectShipment(currentShipment);

        closeCreateShipmentModal();

    } catch (error) {

        console.error(error);

        // Backend trả sẵn message phù hợp cho từng
        // trường hợp lỗi (400/403/404/409 — xem mục 7
        // của tài liệu API).
        alert(
            error?.message ??
            "Tạo lô hàng và sinh mã thất bại."
        );

    } finally {

        setGenerateLoading(false);
    }
}

function validateForm() {

    if (!productionLotSelect.value) {
        alert("Vui lòng chọn Production Lot.");
        productionLotSelect.focus();
        return false;
    }

    if (!shipmentNameInput.value.trim()) {
        alert("Vui lòng nhập Shipment Name.");
        shipmentNameInput.focus();
        return false;
    }

    const quantity = Number(totalQuantityInput.value);

    if (Number.isNaN(quantity) || quantity <= 0) {
        alert("Total Quantity phải lớn hơn 0.");
        totalQuantityInput.focus();
        return false;
    }

    return true;
}

function setGenerateLoading(isLoading) {

    generateButton.disabled = isLoading;
    generateButton.textContent = isLoading ? "Generating..." : "Generate QR";
}

/* ============================================================
 * Shipment result
 * ============================================================ */

function selectShipment(shipment) {

    if (!shipment) {
        shipmentInfoCard.hidden = true;
        traceCodeSection.hidden = true;
        noShipmentState.hidden = false;
        return;
    }

    noShipmentState.hidden = true;
    shipmentInfoCard.hidden = false;
    traceCodeSection.hidden = false;

    renderShipmentCard(shipment);
    renderTraceGrid();
}

function renderShipmentCard(shipment) {

    shipmentNameEl.textContent = shipment.name ?? "-";
    shipmentIdEl.textContent = shipment.id ?? "-";
    shipmentProductionLotEl.textContent = shipment.productionLotName ?? "-";
    shipmentQuantityEl.textContent = `${shipment.totalQuantity ?? 0} mã`;

    renderStatusBadge(shipmentStatusBadge, shipment.status);
}

function renderStatusBadge(element, status) {

    element.textContent = status ?? "-";

    element.className =
        `badge ${STATUS_BADGE_CLASS[status] ?? "badge-neutral"}`;
}

/* Menu (thao tác chỉ ở phía client, không gọi API) */

shipmentMenuToggle.addEventListener("click", () => {
    shipmentMenuDropdown.hidden = !shipmentMenuDropdown.hidden;
});

document.addEventListener("click", event => {

    if (!shipmentMenuDropdown.contains(event.target)
        && event.target !== shipmentMenuToggle) {

        shipmentMenuDropdown.hidden = true;
    }
});

copyShipmentIdButton.addEventListener("click", async () => {

    if (!currentShipment) {
        return;
    }

    try {
        await navigator.clipboard.writeText(currentShipment.id);
    } catch (error) {
        console.error(error);
    }

    shipmentMenuDropdown.hidden = true;
});

printAllFromMenuButton.addEventListener("click", () => {
    shipmentMenuDropdown.hidden = true;
    printBatch();
});

/* ============================================================
 * Trace code grid + pagination
 * (mã truy xuất đã có sẵn trong response tạo
 * shipment — không cần gọi thêm API danh sách)
 * ============================================================ */

function renderTraceGrid() {

    const traceCodes = currentShipment?.traceCodes ?? [];

    traceCodeGrid.innerHTML = "";

    if (traceCodes.length === 0) {

        traceCodeGrid.innerHTML =
            `<div class="empty-trace">Chưa có Trace Code.</div>`;

        pagination.innerHTML = "";

        return;
    }

    const totalPages = Math.ceil(traceCodes.length / PAGE_SIZE);

    currentPage = Math.min(currentPage, totalPages) || 1;

    const start = (currentPage - 1) * PAGE_SIZE;

    traceCodes
        .slice(start, start + PAGE_SIZE)
        .forEach(trace => traceCodeGrid.appendChild(buildTraceCard(trace)));

    renderPagination(totalPages);
}

function buildTraceCard(trace) {

    const node = traceCardTemplate.content.cloneNode(true);

    const img = node.querySelector(".trace-qr-image");
    const codeValue = node.querySelector(".trace-code-value");
    const statusBadge = node.querySelector(".trace-status");
    const downloadButton = node.querySelector(".btn-download");
    const printButtonEl = node.querySelector(".btn-print");

    img.src = getQrImageUrl(trace.qrImage);
    img.alt = trace.codeValue ?? "QR Code";

    img.onerror = () => {
        img.src = "/frontend/assets/images/qr-placeholder.png";
    };

    codeValue.textContent = trace.codeValue ?? "-";

    renderStatusBadge(statusBadge, trace.status);

    downloadButton.addEventListener("click", () => downloadQr(trace));
    printButtonEl.addEventListener("click", () => openPrintModal(trace));

    // Kích hoạt tem (TraceCode -> ACTIVE) không thuộc
    // phạm vi API này (xem mục 10 - "Không bao gồm"),
    // nên card ở đây chỉ hiển thị trạng thái, không có
    // hành động kích hoạt.

    return node;
}

function renderPagination(totalPages) {

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => goToPage(currentPage - 1));
    pagination.appendChild(prevButton);

    for (let page = 1; page <= totalPages; page++) {

        const pageButton = document.createElement("button");

        pageButton.textContent = String(page);

        if (page === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => goToPage(page));

        pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => goToPage(currentPage + 1));
    pagination.appendChild(nextButton);
}

function goToPage(page) {
    currentPage = page;
    renderTraceGrid();
}

/* ============================================================
 * Download QR (chỉ dùng đường dẫn ảnh có sẵn,
 * không cần API riêng)
 * ============================================================ */

function downloadQr(trace) {

    const link = document.createElement("a");

    link.href = getQrImageUrl(trace.qrImage);
    link.download = `${trace.codeValue ?? "qr-code"}.png`;
    link.target = "_blank";
    link.rel = "noopener";

    document.body.appendChild(link);
    link.click();
    link.remove();
}

/* ============================================================
 * Print (single + batch) — xử lý hoàn toàn ở client
 * ============================================================ */

function openPrintModal(trace) {

    currentPrintTrace = trace;

    printContent.innerHTML = buildPrintCardHtml(trace);

    printModal.style.display = "flex";
}

function closePrintModal() {
    printModal.style.display = "none";
}

printModalClose.addEventListener("click", closePrintModal);
cancelPrintButton.addEventListener("click", closePrintModal);

printModal.addEventListener("click", event => {
    if (event.target === printModal) {
        closePrintModal();
    }
});

printButton.addEventListener("click", () => {

    if (currentPrintTrace) {
        printCards([currentPrintTrace]);
    }
});

printBatchButton.addEventListener("click", printBatch);

function printBatch() {

    const traceCodes = currentShipment?.traceCodes ?? [];

    if (traceCodes.length === 0) {
        alert("Chưa có Trace Code để in.");
        return;
    }

    printCards(traceCodes);
}

function buildPrintCardHtml(trace) {

    return `
        <div class="print-card">
            <img src="${getQrImageUrl(trace.qrImage)}" style="width:220px;height:220px;">
            <h3>${escapeHtml(trace.codeValue ?? "-")}</h3>
            <p>${escapeHtml(currentShipment?.name ?? "-")}</p>
            <p>${escapeHtml(currentShipment?.productionLotName ?? "-")}</p>
        </div>
    `;
}

function printCards(traceCodes) {

    const popup = window.open("", "_blank", "width=800,height=900");

    const cardsHtml = traceCodes.map(buildPrintCardHtml).join("");

    popup.document.write(`
        <html>
        <head>
            <title>In Tem QR</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .print-card {
                    display: inline-block;
                    width: 260px;
                    text-align: center;
                    padding: 20px;
                    page-break-inside: avoid;
                }
                .print-card img { width: 220px; height: 220px; }
                .print-card h3 { margin: 12px 0 4px; }
                .print-card p { margin: 2px 0; color: #555; }
            </style>
        </head>
        <body>${cardsHtml}</body>
        </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
    popup.close();
}

/* ============================================================
 * Helpers
 * ============================================================ */

function getQrImageUrl(path) {

    if (!path) {
        return "";
    }

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return API_FILE_BASE_URL + path;
}

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}

/* ============================================================
 * Initialize
 * ============================================================ */

async function initializePage() {

    selectShipment(null);

    populateUserInformation();

    await loadProductionLots();
}

initializePage();