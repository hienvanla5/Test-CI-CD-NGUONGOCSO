import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    canCreateFarmLog
} from "../../../core/permissions.js";

import {
    populateUserInfo
} from "../../../components/user-info.js";

import {
    getProductionLots
} from "../../../services/production-lot.service.js";

import {
    createFarmLog
} from "../../../services/farm-log.service.js";

import {
    getElement,
    hideElement,
    showElement,
    showOnlyState,
    setDisabled
} from "../../../utils/dom.utils.js";

import {
    getActivityLabel,
    isAllowedFarmLogStatus,
    formatDate,
    optionalText
} from "../../../utils/farm-log.utils.js";

const PRODUCTION_LOT_LIST_URL =
    "/frontend/pages/cooperative/production-lots/index.html";

const DEFAULT_SUBMIT_TEXT =
    "Lưu nhật ký";

const elements = {
    loadingState:
        getElement("loadingState"),
    errorState:
        getElement("errorState"),
    errorMessage:
        getElement("errorMessage"),
    unauthorizedState:
        getElement("unauthorizedState"),
    mainContent:
        getElement("mainContent"),

    form:
        getElement("farmLogForm"),
    formMessage:
        getElement("formMessage"),
    submitButton:
        getElement("submitButton"),
    retryButton:
        getElement("retryButton"),
    backButton:
        getElement("backButton"),
    cancelButton:
        getElement("cancelButton"),

    productionLot:
        getElement("productionLotId"),
    activityType:
        getElement("activityType"),
    material:
        getElement("material"),
    quantity:
        getElement("quantity"),
    unit:
        getElement("unit"),
    executedDate:
        getElement("executedDate"),
    notes:
        getElement("notes"),
    notesCounter:
        getElement("notesCounter"),

    summaryProductionLot:
        getElement("summaryProductionLot"),
    summaryActivityType:
        getElement("summaryActivityType"),
    summaryMaterial:
        getElement("summaryMaterial"),
    summaryQuantity:
        getElement("summaryQuantity"),
    summaryUnit:
        getElement("summaryUnit"),
    summaryExecutedDate:
        getElement("summaryExecutedDate"),
    summaryNotes:
        getElement("summaryNotes")
};

const pageStates = {
    loading:
        elements.loadingState,
    error:
        elements.errorState,
    unauthorized:
        elements.unauthorizedState,
    main:
        elements.mainContent
};

const pageStateDisplays = {
    loading: "flex",
    error: "flex",
    unauthorized: "flex",
    main: "block"
};

const productionLotIdFromUrl =
    new URLSearchParams(
        window.location.search
    ).get("productionLotId");

function changePageState(stateName) {
    showOnlyState(
        pageStates,
        stateName,
        pageStateDisplays
    );
}

function goBack() {
    window.location.href =
        PRODUCTION_LOT_LIST_URL;
}

function showLoadError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent =
            message ||
            "Không thể tải dữ liệu.";
    }

    changePageState("error");
}

function showFormMessage(
    message,
    type = "error"
) {
    if (!elements.formMessage) {
        return;
    }

    elements.formMessage.textContent =
        message;

    elements.formMessage.className =
        `form-message ${type}`;

    showElement(
        elements.formMessage
    );
}

function hideFormMessage() {
    if (!elements.formMessage) {
        return;
    }

    elements.formMessage.textContent = "";
    elements.formMessage.className =
        "form-message";

    hideElement(
        elements.formMessage
    );
}

function getSelectedOptionText(
    selectElement
) {
    if (!selectElement) {
        return "—";
    }

    const selectedOption =
        selectElement.options[
            selectElement.selectedIndex
        ];

    if (
        !selectedOption ||
        !selectedOption.value
    ) {
        return "—";
    }

    return selectedOption
        .textContent
        .trim();
}

function updateSummary() {
    if (
        elements.summaryProductionLot
    ) {
        elements.summaryProductionLot
            .textContent =
            getSelectedOptionText(
                elements.productionLot
            );
    }

    if (
        elements.summaryActivityType
    ) {
        elements.summaryActivityType
            .textContent =
            getActivityLabel(
                elements.activityType
                    ?.value
            );
    }

    if (elements.summaryMaterial) {
        elements.summaryMaterial
            .textContent =
            elements.material
                ?.value.trim() ||
            "—";
    }

    if (elements.summaryQuantity) {
        elements.summaryQuantity
            .textContent =
            elements.quantity
                ?.value ||
            "—";
    }

    if (elements.summaryUnit) {
        elements.summaryUnit
            .textContent =
            elements.unit
                ?.value.trim() ||
            "—";
    }

    if (
        elements.summaryExecutedDate
    ) {
        elements.summaryExecutedDate
            .textContent =
            formatDate(
                elements.executedDate
                    ?.value
            );
    }

    if (elements.summaryNotes) {
        elements.summaryNotes
            .textContent =
            elements.notes
                ?.value.trim() ||
            "—";
    }

    if (elements.notesCounter) {
        elements.notesCounter
            .textContent =
            `${
                elements.notes
                    ?.value.length || 0
            } / 1000`;
    }
}

function createProductionLotOption(
    lot
) {
    const option =
        document.createElement(
            "option"
        );

    option.value =
        String(lot.id);

    option.textContent =
        `${lot.name || "Lô chưa đặt tên"} (${lot.status || "—"})`;

    return option;
}

function renderProductionLots(lots) {
    if (!elements.productionLot) {
        return;
    }

    elements.productionLot
        .replaceChildren();

    const placeholder =
        document.createElement(
            "option"
        );

    placeholder.value = "";
    placeholder.textContent =
        "-- Chọn lô sản xuất --";

    elements.productionLot
        .appendChild(placeholder);

    if (lots.length === 0) {
        const emptyOption =
            document.createElement(
                "option"
            );

        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent =
            "Không có lô APPROVED hoặc HARVESTED";

        elements.productionLot
            .appendChild(
                emptyOption
            );

        setDisabled(
            elements.productionLot,
            true
        );

        setDisabled(
            elements.submitButton,
            true
        );

        showFormMessage(
            "Không có lô sản xuất phù hợp để ghi nhật ký.",
            "error"
        );

        updateSummary();
        return;
    }

    lots.forEach(function (lot) {
        elements.productionLot
            .appendChild(
                createProductionLotOption(
                    lot
                )
            );
    });

    setDisabled(
        elements.productionLot,
        false
    );

    setDisabled(
        elements.submitButton,
        false
    );

    if (productionLotIdFromUrl) {
        const selectedLot =
            lots.find(function (lot) {
                return (
                    String(lot.id) ===
                    String(
                        productionLotIdFromUrl
                    )
                );
            });

        if (selectedLot) {
            elements.productionLot.value =
                String(selectedLot.id);

            setDisabled(
                elements.productionLot,
                true
            );
        } else {
            showFormMessage(
                "Lô sản xuất không tồn tại, không thuộc tổ chức hoặc không ở trạng thái phù hợp.",
                "error"
            );

            setDisabled(
                elements.submitButton,
                true
            );
        }
    }

    updateSummary();
}

async function loadProductionLots() {
    changePageState("loading");
    hideFormMessage();

    try {
        const response =
            await getProductionLots();

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Không thể tải danh sách lô sản xuất."
            );
        }

        const lots =
            Array.isArray(response.data)
                ? response.data.filter(
                    function (lot) {
                        return (
                            lot &&
                            lot.id &&
                            isAllowedFarmLogStatus(
                                lot.status
                            )
                        );
                    }
                )
                : [];

        renderProductionLots(lots);
        changePageState("main");
    } catch (error) {
        console.error(
            "[Farm Log Create] Không thể tải danh sách lô:",
            error
        );

        showLoadError(
            error.message ||
            "Không thể tải danh sách lô sản xuất."
        );
    }
}

function clearFieldErrors() {
    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(function (
            errorElement
        ) {
            errorElement.textContent =
                "";
        });

    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(function (
            inputElement
        ) {
            inputElement.classList
                .remove(
                    "input-error"
                );

            inputElement.setAttribute(
                "aria-invalid",
                "false"
            );
        });
}

function setFieldError(
    fieldElement,
    message
) {
    if (!fieldElement) {
        return;
    }

    fieldElement.classList.add(
        "input-error"
    );

    fieldElement.setAttribute(
        "aria-invalid",
        "true"
    );

    const errorElement =
        getElement(
            `${fieldElement.id}Error`
        );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function validateForm() {
    clearFieldErrors();

    let isValid = true;

    if (
        !elements.productionLot
            ?.value
    ) {
        setFieldError(
            elements.productionLot,
            "Vui lòng chọn lô sản xuất."
        );

        isValid = false;
    }

    if (
        !elements.activityType
            ?.value
    ) {
        setFieldError(
            elements.activityType,
            "Vui lòng chọn loại hoạt động."
        );

        isValid = false;
    }

    const material =
        elements.material
            ?.value.trim() || "";

    if (material.length > 255) {
        setFieldError(
            elements.material,
            "Tên vật tư không được vượt quá 255 ký tự."
        );

        isValid = false;
    }

    const quantityValue =
        elements.quantity
            ?.value || "";

    if (
        quantityValue !== "" &&
        (
            Number.isNaN(
                Number(quantityValue)
            ) ||
            Number(quantityValue) <= 0
        )
    ) {
        setFieldError(
            elements.quantity,
            "Số lượng phải lớn hơn 0."
        );

        isValid = false;
    }

    const unit =
        elements.unit
            ?.value.trim() || "";

    if (unit.length > 50) {
        setFieldError(
            elements.unit,
            "Đơn vị không được vượt quá 50 ký tự."
        );

        isValid = false;
    }

    if (
        !elements.executedDate
            ?.value
    ) {
        setFieldError(
            elements.executedDate,
            "Vui lòng chọn ngày thực hiện."
        );

        isValid = false;
    }

    const notes =
        elements.notes
            ?.value || "";

    if (notes.length > 1000) {
        setFieldError(
            elements.notes,
            "Ghi chú không được vượt quá 1000 ký tự."
        );

        isValid = false;
    }

    return isValid;
}

function buildRequestBody() {
    return {
        productionLotId:
            elements.productionLot
                .value,

        activityType:
            elements.activityType
                .value,

        material:
            optionalText(
                elements.material
                    .value
            ),

        quantity:
            elements.quantity
                .value === ""
                ? null
                : Number(
                    elements.quantity
                        .value
                ),

        unit:
            optionalText(
                elements.unit.value
            ),

        executedDate:
            elements.executedDate
                .value,

        notes:
            optionalText(
                elements.notes.value
            )
    };
}

function setSubmitting(submitting) {
    setDisabled(
        elements.submitButton,
        submitting
    );

    if (!elements.submitButton) {
        return;
    }

    elements.submitButton
        .setAttribute(
            "aria-busy",
            String(submitting)
        );

    elements.submitButton.textContent =
        submitting
            ? "Đang lưu..."
            : DEFAULT_SUBMIT_TEXT;
}

async function handleSubmit(event) {
    event.preventDefault();
    hideFormMessage();

    if (!validateForm()) {
        showFormMessage(
            "Vui lòng kiểm tra lại thông tin đã nhập.",
            "error"
        );

        return;
    }

    setSubmitting(true);

    try {
        const response =
            await createFarmLog(
                buildRequestBody()
            );

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Không thể lưu nhật ký canh tác."
            );
        }

        showFormMessage(
            "Ghi nhật ký canh tác thành công.",
            "success"
        );

        window.setTimeout(
            goBack,
            1200
        );
    } catch (error) {
        console.error(
            "[Farm Log Create] Không thể lưu nhật ký:",
            error
        );

        showFormMessage(
            error.message ||
            "Không thể lưu nhật ký canh tác.",
            "error"
        );

        setSubmitting(false);
    }
}

function bindEvents() {
    const formFields = [
        elements.productionLot,
        elements.activityType,
        elements.material,
        elements.quantity,
        elements.unit,
        elements.executedDate,
        elements.notes
    ].filter(Boolean);

    formFields.forEach(function (
        field
    ) {
        field.addEventListener(
            "input",
            updateSummary
        );

        field.addEventListener(
            "change",
            updateSummary
        );
    });

    elements.form?.addEventListener(
        "submit",
        handleSubmit
    );

    elements.backButton
        ?.addEventListener(
            "click",
            goBack
        );

    elements.cancelButton
        ?.addEventListener(
            "click",
            goBack
        );

    elements.retryButton
        ?.addEventListener(
            "click",
            loadProductionLots
        );
}

function initializePage() {
    if (!requireAuth()) {
        return;
    }

    const user = getUser();

    populateUserInfo(user);
    setupLogout();
    bindEvents();
    updateSummary();

    if (
        !canCreateFarmLog(
            user?.roleCode
        )
    ) {
        changePageState(
            "unauthorized"
        );

        return;
    }

    loadProductionLots();
}

initializePage();