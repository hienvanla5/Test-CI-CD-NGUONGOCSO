import {
    recordHarvestEvent,
    recordPackagingEvent
} from "../../../services/chain-event.service.js";

const EVENT_TYPES =
    Object.freeze({
        HARVEST: "HARVEST",
        PACKAGING: "PACKAGING"
    });

const modal =
    document.getElementById(
        "productionLotEventModal"
    );
const overlay =
    document.getElementById(
        "productionLotEventOverlay"
    );
const closeButton =
    document.getElementById(
        "closeProductionLotEventButton"
    );
const cancelButton =
    document.getElementById(
        "cancelProductionLotEventButton"
    );
const form =
    document.getElementById(
        "productionLotEventForm"
    );
const title =
    document.getElementById(
        "productionLotEventTitle"
    );
const description =
    document.getElementById(
        "productionLotEventDescription"
    );
const message =
    document.getElementById(
        "productionLotEventMessage"
    );
const lotIdInput =
    document.getElementById(
        "productionLotEventLotId"
    );
const lotNameInput =
    document.getElementById(
        "productionLotEventLotName"
    );
const dateLabel =
    document.getElementById(
        "productionLotEventDateLabel"
    );
const dateInput =
    document.getElementById(
        "productionLotEventDate"
    );
const quantityGroup =
    document.getElementById(
        "harvestQuantityGroup"
    );
const quantityInput =
    document.getElementById(
        "harvestQuantity"
    );
const specificationGroup =
    document.getElementById(
        "packagingSpecificationGroup"
    );
const specificationInput =
    document.getElementById(
        "packagingSpecification"
    );
const submitButton =
    document.getElementById(
        "submitProductionLotEventButton"
    );

let activeEventType = null;

function getTodayValue() {
    const today = new Date();
    const timezoneOffset =
        today.getTimezoneOffset() *
        60 *
        1000;

    return new Date(
        today.getTime() -
        timezoneOffset
    )
        .toISOString()
        .slice(0, 10);
}

function showMessage(
    text,
    type = "error"
) {
    message.textContent = text;
    message.className =
        `modal-message modal-message--${type}`;
    message.hidden = false;
}

function hideMessage() {
    message.textContent = "";
    message.hidden = true;
}

function configureFields(
    eventType,
    button
) {
    const isHarvest =
        eventType ===
        EVENT_TYPES.HARVEST;

    title.textContent =
        isHarvest
            ? "Ghi nhận thu hoạch"
            : "Ghi nhận đóng gói";
    description.textContent =
        isHarvest
            ? "Chuyển lô từ APPROVED sang HARVESTED."
            : "Chuyển lô từ HARVESTED sang PACKAGED.";
    dateLabel.textContent =
        isHarvest
            ? "Ngày thu hoạch"
            : "Ngày đóng gói";
    submitButton.textContent =
        isHarvest
            ? "Xác nhận thu hoạch"
            : "Xác nhận đóng gói";

    quantityGroup.hidden =
        !isHarvest;
    quantityInput.required =
        isHarvest;

    specificationGroup.hidden =
        isHarvest;
    specificationInput.required =
        !isHarvest;

    dateInput.max =
        getTodayValue();
    dateInput.min =
        isHarvest
            ? button.dataset.plantingDate || ""
            : button.dataset.harvestDate || "";
    dateInput.value =
        getTodayValue();
}

function openModal(
    eventType,
    button
) {
    activeEventType = eventType;
    form.reset();
    hideMessage();

    lotIdInput.value =
        button.dataset.id || "";
    lotNameInput.value =
        button.dataset.lotName || "—";

    configureFields(
        eventType,
        button
    );

    modal.hidden = false;
    document.body.classList.add(
        "modal-open"
    );
    dateInput.focus();
}

function closeModal() {
    modal.hidden = true;
    activeEventType = null;
    form.reset();
    hideMessage();
    document.body.classList.remove(
        "modal-open"
    );
}

function setSubmitting(isSubmitting) {
    submitButton.disabled =
        isSubmitting;
    cancelButton.disabled =
        isSubmitting;
    closeButton.disabled =
        isSubmitting;

    if (isSubmitting) {
        submitButton.textContent =
            "Đang lưu...";
    } else {
        submitButton.textContent =
            activeEventType ===
            EVENT_TYPES.HARVEST
                ? "Xác nhận thu hoạch"
                : "Xác nhận đóng gói";
    }
}

function validateForm() {
    if (
        !lotIdInput.value ||
        !dateInput.value
    ) {
        showMessage(
            "Vui lòng nhập đầy đủ thông tin bắt buộc."
        );

        return false;
    }

    if (
        activeEventType ===
        EVENT_TYPES.HARVEST
    ) {
        const quantity =
            Number(quantityInput.value);

        if (
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            showMessage(
                "Sản lượng thực tế phải lớn hơn 0."
            );
            quantityInput.focus();

            return false;
        }
    }

    if (
        activeEventType ===
            EVENT_TYPES.PACKAGING &&
        !specificationInput.value.trim()
    ) {
        showMessage(
            "Vui lòng nhập quy cách đóng gói."
        );
        specificationInput.focus();

        return false;
    }

    return true;
}

async function handleSubmit(event) {
    event.preventDefault();
    hideMessage();

    if (!validateForm()) {
        return;
    }

    try {
        setSubmitting(true);

        if (
            activeEventType ===
            EVENT_TYPES.HARVEST
        ) {
            await recordHarvestEvent({
                productionLotId:
                    lotIdInput.value,
                harvestDate:
                    dateInput.value,
                quantity:
                    Number(
                        quantityInput.value
                    )
            });
        } else {
            await recordPackagingEvent({
                productionLotId:
                    lotIdInput.value,
                packagingDate:
                    dateInput.value,
                packagingSpecification:
                    specificationInput
                        .value
                        .trim()
            });
        }

        const successMessage =
            activeEventType ===
            EVENT_TYPES.HARVEST
                ? "Đã ghi nhận thu hoạch thành công."
                : "Đã ghi nhận đóng gói thành công.";

        closeModal();
        window.alert(successMessage);

        document.dispatchEvent(
            new CustomEvent(
                "production-lot:status-updated"
            )
        );
    } catch (error) {
        console.error(
            "Record production lot event error:",
            error
        );

        showMessage(
            error?.message ||
            "Không thể ghi nhận sự kiện."
        );
    } finally {
        setSubmitting(false);
    }
}

function handleTableClick(event) {
    const button =
        event.target.closest(
            "button"
        );

    if (!button) {
        return;
    }

    if (
        button.classList.contains(
            "btn-record-harvest"
        )
    ) {
        openModal(
            EVENT_TYPES.HARVEST,
            button
        );

        return;
    }

    if (
        button.classList.contains(
            "btn-record-packaging"
        )
    ) {
        openModal(
            EVENT_TYPES.PACKAGING,
            button
        );
    }
}

const tableBody =
    document.getElementById(
        "productionLotsTableBody"
    );

if (tableBody) {
    tableBody.addEventListener(
        "click",
        handleTableClick
    );
}

form?.addEventListener(
    "submit",
    handleSubmit
);
closeButton?.addEventListener(
    "click",
    closeModal
);
cancelButton?.addEventListener(
    "click",
    closeModal
);
overlay?.addEventListener(
    "click",
    closeModal
);

document.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Escape" &&
            modal &&
            !modal.hidden
        ) {
            closeModal();
        }
    }
);
