import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    canViewFarmLogHistory
} from "../../../core/permissions.js";

import {
    populateUserInfo
} from "../../../components/user-info.js";

import {
    getFarmLogHistory
} from "../../../services/farm-log.service.js";

import {
    clearElement,
    getElement,
    hideElement,
    setText,
    showElement,
    showOnlyState
} from "../../../utils/dom.utils.js";

import {
    displayValue,
    formatDate,
    formatDateTime,
    formatQuantity,
    getActivityLabel
} from "../../../utils/farm-log.utils.js";

const PRODUCTION_LOT_LIST_URL =
    "/frontend/pages/cooperative/production-lots/index.html";

const queryParams = new URLSearchParams(window.location.search);
const productionLotId = queryParams.get("productionLotId");
const productionLotNameFromUrl =
    queryParams.get("productionLotName");

const elements = {
    loadingState: getElement("loadingState"),
    errorState: getElement("errorState"),
    errorMessage: getElement("errorMessage"),
    unauthorizedState: getElement("unauthorizedState"),
    mainContent: getElement("mainContent"),

    backButton: getElement("backButton"),
    retryButton: getElement("retryButton"),

    productionLotName: getElement("productionLotName"),
    totalElements: getElement("totalElements"),
    activityCount: getElement("activityCount"),

    emptyState: getElement("emptyState"),
    historyTable: getElement("historyTable"),
    historyTableBody: getElement("historyTableBody"),

    paginationContainer: getElement("paginationContainer"),
    paginationButtons: getElement("paginationButtons"),
    pageSizeSelect: getElement("pageSizeSelect"),
    currentPageText: getElement("currentPageText"),
    totalPagesText: getElement("totalPagesText"),
    paginationTotalElements: getElement("paginationTotalElements")
};

const pageStates = {
    loading: elements.loadingState,
    error: elements.errorState,
    unauthorized: elements.unauthorizedState,
    main: elements.mainContent
};

const pageStateDisplays = {
    loading: "flex",
    error: "flex",
    unauthorized: "flex",
    main: "block"
};

const paginationState = {
    page: 0,
    size: Number(elements.pageSizeSelect?.value || 10),
    totalPages: 0
};

function changePageState(stateName) {
    showOnlyState(pageStates, stateName, pageStateDisplays);
}

function goBack() {
    window.location.href = PRODUCTION_LOT_LIST_URL;
}

function showError(message) {
    setText(
        elements.errorMessage,
        message || "Không thể tải lịch sử nhật ký."
    );

    changePageState("error");
}

function updateLotName(items) {
    const nameFromResponse = items.find(
        (item) => item?.productionLotName
    )?.productionLotName;

    setText(
        elements.productionLotName,
        nameFromResponse || productionLotNameFromUrl || "—"
    );
}

function updateSummary(pageData) {
    const totalElements = Number(pageData.totalElements || 0);
    const totalPages = Number(pageData.totalPages || 0);
    const currentPage = Number(pageData.page || 0);

    paginationState.page = currentPage;
    paginationState.totalPages = totalPages;

    setText(elements.totalElements, totalElements);
    setText(elements.activityCount, totalElements);
    setText(elements.currentPageText, currentPage + 1);
    setText(elements.totalPagesText, Math.max(totalPages, 1));
    setText(elements.paginationTotalElements, totalElements);
}

function createCell(value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = displayValue(value);

    if (className) {
        cell.className = className;
    }

    return cell;
}

function createHistoryRow(item) {
    const row = document.createElement("tr");

    row.append(
        createCell(formatDate(item.executedDate)),
        createCell(getActivityLabel(item.activityType)),
        createCell(item.material),
        createCell(formatQuantity(item.quantity)),
        createCell(item.unit),
        createCell(item.createdByName),
        createCell(formatDateTime(item.createdAt)),
        createCell(item.notes, "notes-cell")
    );

    return row;
}

function renderTable(items) {
    clearElement(elements.historyTableBody);

    const fragment = document.createDocumentFragment();

    items.forEach((item) => {
        fragment.appendChild(createHistoryRow(item));
    });

    elements.historyTableBody?.appendChild(fragment);

    hideElement(elements.emptyState);
    showElement(elements.historyTable, "table");
}

function showEmptyState() {
    clearElement(elements.historyTableBody);
    hideElement(elements.historyTable);
    hideElement(elements.paginationContainer);
    showElement(elements.emptyState, "flex");
}

function getVisiblePageNumbers(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index);
    }

    const firstPage = Math.max(
        0,
        Math.min(currentPage - 2, totalPages - 5)
    );

    return Array.from({ length: 5 }, (_, index) => firstPage + index);
}

function createPageButton(label, targetPage, options = {}) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "pagination-button";
    button.textContent = label;
    button.disabled = Boolean(options.disabled);
    button.setAttribute(
        "aria-label",
        options.ariaLabel || `Đến trang ${targetPage + 1}`
    );

    if (options.active) {
        button.classList.add("active");
        button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
        if (
            targetPage === paginationState.page ||
            targetPage < 0 ||
            targetPage >= paginationState.totalPages
        ) {
            return;
        }

        loadHistory(targetPage, paginationState.size);
    });

    return button;
}

function renderPagination(pageData) {
    clearElement(elements.paginationButtons);

    const currentPage = Number(pageData.page || 0);
    const totalPages = Number(pageData.totalPages || 0);

    if (totalPages <= 1) {
        hideElement(elements.paginationContainer);
        return;
    }

    elements.paginationButtons?.appendChild(
        createPageButton("‹", currentPage - 1, {
            disabled: Boolean(pageData.first) || currentPage === 0,
            ariaLabel: "Trang trước"
        })
    );

    getVisiblePageNumbers(currentPage, totalPages).forEach((pageNumber) => {
        elements.paginationButtons?.appendChild(
            createPageButton(String(pageNumber + 1), pageNumber, {
                active: pageNumber === currentPage
            })
        );
    });

    elements.paginationButtons?.appendChild(
        createPageButton("›", currentPage + 1, {
            disabled:
                Boolean(pageData.last) ||
                currentPage >= totalPages - 1,
            ariaLabel: "Trang sau"
        })
    );

    showElement(elements.paginationContainer, "flex");
}

function renderPage(pageData) {
    const items = Array.isArray(pageData.items)
        ? pageData.items
        : [];

    updateLotName(items);
    updateSummary(pageData);
    changePageState("main");

    if (items.length === 0) {
        showEmptyState();
        return;
    }

    renderTable(items);
    renderPagination(pageData);
}

async function loadHistory(
    page = paginationState.page,
    size = paginationState.size
) {
    changePageState("loading");

    try {
        const response = await getFarmLogHistory(
            productionLotId,
            page,
            size
        );

        if (!response || response.success !== true || !response.data) {
            throw new Error(
                response?.message || "Dữ liệu trả về không hợp lệ."
            );
        }

        paginationState.page = page;
        paginationState.size = size;
        renderPage(response.data);
    } catch (error) {
        console.error(
            "[Farm Log History] Không thể tải lịch sử:",
            error
        );

        showError(
            error.message || "Không thể tải lịch sử nhật ký."
        );
    }
}

function bindEvents() {
    elements.backButton?.addEventListener("click", goBack);

    elements.retryButton?.addEventListener("click", () => {
        loadHistory(paginationState.page, paginationState.size);
    });

    elements.pageSizeSelect?.addEventListener("change", (event) => {
        const newSize = Number(event.target.value);

        if (![5, 10, 20].includes(newSize)) {
            return;
        }

        paginationState.size = newSize;
        loadHistory(0, newSize);
    });
}

function initializePage() {
    if (!requireAuth()) {
        return;
    }

    const user = getUser();

    populateUserInfo(user);
    setupLogout();
    bindEvents();
    setText(
        elements.productionLotName,
        productionLotNameFromUrl || "—"
    );

    if (!canViewFarmLogHistory(user?.roleCode)) {
        changePageState("unauthorized");
        return;
    }

    if (!productionLotId) {
        showError(
            "Thiếu productionLotId. Hãy mở lịch sử từ danh sách lô sản xuất."
        );
        return;
    }

    loadHistory(0, paginationState.size);
}

initializePage();