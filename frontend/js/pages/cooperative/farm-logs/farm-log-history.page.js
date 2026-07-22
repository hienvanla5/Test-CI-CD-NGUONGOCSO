import {
    getFarmLogHistory
} from "../../../services/farm-log.service.js";

import {
    clearAuth
} from "../../../core/storage.js";

document.addEventListener(
    "DOMContentLoaded",
    initPage
);

async function initPage() {
    bindEvents();

    const productionLotId =
        getProductionLotId();

    const productionLotName =
        getProductionLotName();

    setText(
        "productionLotName",
        productionLotName || "—"
    );

    if (!productionLotId) {
        showError(
            "Thiếu productionLotId."
        );

        return;
    }

    await loadFarmLogHistory(
        productionLotId,
        0,
        10
    );
}

function bindEvents() {
    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const backButton =
        document.getElementById(
            "backButton"
        );

    const retryButton =
        document.getElementById(
            "retryButton"
        );

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            handleLogout
        );
    }

    if (backButton) {
        backButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "../production-lots/index.html";
            }
        );
    }

    if (retryButton) {
        retryButton.addEventListener(
            "click",
            () => {
                window.location.reload();
            }
        );
    }
}

function getProductionLotId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "productionLotId"
    );
}

function getProductionLotName() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "productionLotName"
    );
}

async function loadFarmLogHistory(
    productionLotId,
    page,
    size
) {
    showLoading();

    try {
        const response =
            await getFarmLogHistory(
                productionLotId,
                page,
                size
            );

        const pageData =
            response?.data;

        if (!pageData) {
            throw new Error(
                "Dữ liệu trả về không hợp lệ."
            );
        }

        renderPage(pageData);
    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Không thể tải lịch sử nhật ký."
        );
    }
}

function renderPage(pageData) {
    hideAllStates();

    const items =
        Array.isArray(pageData.items)
            ? pageData.items
            : [];

    updateSummary(pageData);

    const mainContent =
        document.getElementById(
            "mainContent"
        );

    if (mainContent) {
        mainContent.style.display =
            "block";
    }

    if (items.length === 0) {
        showEmptyState();

        return;
    }

    renderTable(items);
    renderPagination(pageData);
}

function updateSummary(pageData) {
    const totalElements =
        pageData.totalElements ?? 0;

    setText(
        "totalElements",
        totalElements
    );

    setText(
        "activityCount",
        totalElements
    );

    setText(
        "paginationTotalElements",
        totalElements
    );

    setText(
        "currentPageText",
        (pageData.page ?? 0) + 1
    );

    setText(
        "totalPagesText",
        pageData.totalPages ?? 0
    );
}

function showEmptyState() {
    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const historyTable =
        document.getElementById(
            "historyTable"
        );

    const paginationContainer =
        document.getElementById(
            "paginationContainer"
        );

    if (emptyState) {
        emptyState.style.display =
            "flex";
    }

    if (historyTable) {
        historyTable.style.display =
            "none";
    }

    if (paginationContainer) {
        paginationContainer.style.display =
            "none";
    }
}

function renderTable(items) {
    const tableBody =
        document.getElementById(
            "historyTableBody"
        );

    const historyTable =
        document.getElementById(
            "historyTable"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    if (!tableBody || !historyTable) {
        return;
    }

    tableBody.innerHTML =
        items
            .map(createTableRow)
            .join("");

    historyTable.style.display =
        "table";

    if (emptyState) {
        emptyState.style.display =
            "none";
    }
}

function createTableRow(item) {
    return `
        <tr>
            <td>
                ${formatDate(item.executedDate)}
            </td>

            <td>
                ${escapeHtml(
                    item.activityType ?? "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.material ?? "—"
                )}
            </td>

            <td>
                ${item.quantity ?? "—"}
            </td>

            <td>
                ${escapeHtml(
                    item.unit ?? "—"
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.createdByName ?? "—"
                )}
            </td>

            <td>
                ${formatDateTime(
                    item.createdAt
                )}
            </td>

            <td class="notes-cell">
                ${escapeHtml(
                    item.notes ?? "—"
                )}
            </td>
        </tr>
    `;
}

function renderPagination(pageData) {
    const container =
        document.getElementById(
            "paginationContainer"
        );

    const buttons =
        document.getElementById(
            "paginationButtons"
        );

    if (!container || !buttons) {
        return;
    }

    container.style.display =
        "flex";

    buttons.innerHTML = "";

    const currentPage =
        pageData.page ?? 0;

    const totalPages =
        pageData.totalPages ?? 0;

    if (totalPages <= 1) {
        return;
    }

    buttons.appendChild(
        createPageButton(
            "‹",
            currentPage - 1,
            currentPage === 0
        )
    );

    for (
        let index = 0;
        index < totalPages;
        index += 1
    ) {
        buttons.appendChild(
            createPageButton(
                String(index + 1),
                index,
                false,
                index === currentPage
            )
        );
    }

    buttons.appendChild(
        createPageButton(
            "›",
            currentPage + 1,
            currentPage >= totalPages - 1
        )
    );
}

function createPageButton(
    label,
    page,
    disabled,
    active = false
) {
    const button =
        document.createElement(
            "button"
        );

    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.className =
        "pagination-button";

    if (active) {
        button.classList.add(
            "active"
        );
    }

    button.addEventListener(
        "click",
        async () => {
            const productionLotId =
                getProductionLotId();

            const pageSize =
                Number(
                    document
                        .getElementById(
                            "pageSizeSelect"
                        )
                        ?.value || 10
                );

            await loadFarmLogHistory(
                productionLotId,
                page,
                pageSize
            );
        }
    );

    return button;
}

function showLoading() {
    hideAllStates();

    const loadingState =
        document.getElementById(
            "loadingState"
        );

    if (loadingState) {
        loadingState.style.display =
            "flex";
    }
}

function showError(message) {
    hideAllStates();

    const errorState =
        document.getElementById(
            "errorState"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );

    if (errorMessage) {
        errorMessage.textContent =
            message;
    }

    if (errorState) {
        errorState.style.display =
            "flex";
    }
}

function hideAllStates() {
    const elementIds = [
        "loadingState",
        "errorState",
        "unauthorizedState",
        "mainContent"
    ];

    elementIds.forEach(
        (elementId) => {
            const element =
                document.getElementById(
                    elementId
                );

            if (element) {
                element.style.display =
                    "none";
            }
        }
    );
}

function setText(
    elementId,
    value
) {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent =
            String(value);
    }
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const [
        year,
        month,
        day
    ] = value.split("-");

    return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "vi-VN"
    );
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function handleLogout() {
    clearAuth();

    window.location.href =
        "/frontend/pages/auth/login.html";
}